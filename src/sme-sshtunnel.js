"use strict";

const { config } = require('process');
const Core = require('./sme-core.js');

module.exports = function (RED) {
    const child_process = require('child_process');

    const SmeTunnelClientMessageTypeID = 'AE32A0C6-D7FB-4671-A598-8C4F30BFBFD1';
    const SmeTunnelServerMessageTypeID = 'F5158B75-D63D-4318-9B2F-8FD237E0BA68';

    function sendTunnelInfo(node, info) {
        if (node && info) {
            var smeTunnelMsg = {
                Type: "client",
                TypeID: SmeTunnelClientMessageTypeID,
                Command: 'info',
                TunnelName: node.name,
                Body: info,
            };

            node.log(info);
            node.smeConnector.postMessage(smeTunnelMsg);
        }
    }

    function startTunnel(node, args) {
        if (node.serving)
            return;
        
        node.log("Start establishing connection using ssh");

        const localHost = node.host;
        const localPort = node.port;

        var remotePort = args.TunnelPort;
        var remoteServer = args.TunnelServer || 'tunn@tunnels.semilimes.net';
        var tunnelUrl = args.TunnelUrl || `https://${args.SiteId}.tunnels.semilimes.net`;

        const params = ['-o StrictHostKeyChecking=no', '-R', `${remotePort}:${localHost}:${localPort.toString()}`, remoteServer, '-N'];

        try {
            var sshprocess = child_process.spawn("ssh", params);
            node.sshprocess = sshprocess;
            node.status({ fill: "green", shape: "dot", text: "connected" });
            node.sshProcess = sshprocess;
            node.serving = true;

            sshprocess.on('close', (code, signal) => {
                node.status({ fill: "red", shape: "dot", text: "stopped" });
                sendTunnelInfo(node, 'Tunnel connection aborted');
                node.serving = false;
            });

            sshprocess.on('error', (error) => {
                node.status({ fill: "red", shape: "dot", text: "error" });
                sendTunnelInfo(node, `${error}`);
            });
        }
        catch (ex) {
            node.status({ fill: "red", shape: "dot", text: "ssh failed" });
            sendTunnelInfo(node, `Failed to create ssh tunnel: ${ex}`);
        }

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

        node.status({ fill: "red", shape: "dot", text: "stopped" });
        sendTunnelInfo(node, 'Aborting tunnel connection');
        
        if (node.sshprocess) {
            node.sshprocess.kill();
            node.sshprocess = null;
        }
    }

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        var smeConnector = config.connector && RED.nodes.getNode(config.connector);
        if (!smeConnector)
            return;

        this.smeConnector = smeConnector;

        var node = this;

        node.name = config.name;
        node.host = config.host;
        node.port = config.port && parseInt(config.port),

        node.serving = false;
        node.sshProcess = null;

        //	Listener for message...
        smeConnector.addMessageListener(smeMsg => {
            //  Check if it is Tunnel Form Submission.
            if ((smeMsg.TypeID || '').toUpperCase() == SmeTunnelServerMessageTypeID) {
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

            if (node.name && node.host && node.port) {
                var smeTunnelMsg = {
                    Type: "client",
                    TypeID: SmeTunnelClientMessageTypeID,
                    Command: 'create',
                    TunnelName: node.name,
                };

                node.log(`Create tunnel: ${node.name}`);
                smeConnector.postMessage(smeTunnelMsg);

                send(msg, false);
            }

            done && done();
        });
    };

    RED.nodes.registerType("sme-sshtunnel", SmeNode);
};