"use strict";

const { config } = require('process');
const Core = require('./sme-core.js');

module.exports = function (RED) {
    const child_process = require('child_process');

    const SmeTunnelClientMessageTypeID = 'AE32A0C6-D7FB-4671-A598-8C4F30BFBFD1';
    const SmeTunnelServerMessageTypeID = 'F5158B75-D63D-4318-9B2F-8FD237E0BA68';

    function startTunnel(node, args) {
        if (node.serving)
            return;
        
        node.log("Start establishing connection using ssh");

        const localHost = node.siteSettings.host;
        const localPort = node.siteSettings.port;

        var remotePort = args.RemotePort;
        var remoteServer = args.RemoteServer || 'tunn@tunnels.semilimes.net';
        var tunnelUrl = args.TunnelUrl || `https://${args.SiteId}.tunnels.semilimes.net`;

        const params = ['-o StrictHostKeyChecking=no', '-R', `${remotePort}:${localHost}:${localPort.toString()}`, remoteServer, '-N'];

        sshprocess = child_process.spawn("ssh", params);
        node.status({ fill: "green", shape: "dot", text: "connected" });
        node.sshProcess = sshprocess;
        node.serving = true;

        sshprocess.on('close', (code, signal) => {
            node.status({ fill: "red", shape: "dot", text: "stopped" });
            node.log("Tunnel connection aborted");
            node.serving = false;
        });

        node.on('close', function () {
            stopTunnel(node);
        });

        //  Continue the flow.
        node.send({
            payload: {
                TunnelUrl: tunnelUrl,
            }
        });
    }
    
    function stopTunnel(node) {
        if (!node.serving)
            return;

        const siteId = node.siteSettings.credentials.siteId;
        node.status({ fill: "red", shape: "dot", text: "stopped" });
        node.log("Aborting tunnel connection");
        sshprocess.kill();
    }

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        var smeConnector = config.connector && RED.nodes.getNode(config.connector);
        if (!smeConnector)
            return;

        var node = this;

        node.name = this.credentials.name;
        node.siteSettings = {
            host: this.credentials.credentials.host,
            port: this.credentials.port && parseInt(this.credentials.port),
        };
        node.serving = false;
        node.sshProcess = null;

        //	Listener for message...
        smeConnector.addMessageListener(smeMsg => {
            //  Check if it is Tunnel Form Submission.
            if (smeMsg.TypeID == SmeTunnelServerMessageTypeID) {
                if (smeMsg.TunnelName == node.name) {
                    var command = smeMsg.Command;
                    switch (command) {
                        case 'start':
                            startTunnel(node, {
                                RemotePort: smeMsg.TunnelPort,
                                RemoteServer: smeMsg.TunnelServer,
                                TunnelUrl: smeMsg.TunnelUrl,
                            });
                            break;
                        case 'stop':
                            stopTunnel(node);
                            break;
                        default:
                            node.log(`Uknown command: ${command}`)
                    }
                }
            }
        });

        //  Send message to semilimes to create tunnel.
        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            if (this.siteSettings.host && this.siteSettings.port) {
                var smeTunnelMsg = {
                    Type: "client",
                    TypeID: SmeTunnelClientMessageTypeID,
                    Command: 'create',
                    TunnelName: node.name,
                };

                smeConnector.sendMessage(smeTunnelMsg, false);

                send(msg, false);
            }

            done && done();
        });
    };

    RED.nodes.registerType("sme-sshtunnel", SmeNode);
};