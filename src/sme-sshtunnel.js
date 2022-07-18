"use strict";

const { config } = require('process');
const { debug } = require('util');
const Core = require('./sme-core.js');

module.exports = function (RED) {
    const { Client } = require('ssh2');
    const forge = require('node-forge');
    const fs = require('fs');

    const SmeTunnelClientMessageTypeID = 'AE32A0C6-D7FB-4671-A598-8C4F30BFBFD1';
    const SmeTunnelServerMessageTypeID = 'F5158B75-D63D-4318-9B2F-8FD237E0BA68';

    function generateCA(id) {
        const rsa = forge.pki.rsa;

        const keypair = rsa.generateKeyPair({ bits: 4096 });
        const sshPubKey = forge.ssh.publicKeyToOpenSSH(keypair.publicKey);
        const sshPrivateKey = forge.ssh.privateKeyToOpenSSH(keypair.privateKey);

        fs.writeFileSync(`sme_node_${id}_rsa`, sshPrivateKey);
        fs.writeFileSync(`sme_node_${id}_rsa.pub`, sshPubKey);
        fs.chmodSync(`sme_node_${id}_rsa`, '400')
    }

    function getCA(id) {
        if (!(fs.existsSync(`sme_node_${id}_rsa`) && fs.existsSync(`sme_node_${id}_rsa.pub`))) {
            generateCA(id);
        }

        const pubKey = fs.readFileSync(`sme_node_${id}_rsa.pub`, 'utf-8');
        return pubKey
    }

    function getPrivateKey(id) {
        const privateKey = fs.readFileSync(`sme_node_${id}_rsa`, 'utf8');
        return privateKey;
    }

    function createConnection(node, localAddr, localPort) {
        const conn = new Client();
        conn.on('connect', function () {
                node.log('SSH2::connect')
            })
            .on('tcp connection', function (info, accept) {
                const stream = accept();

                stream.on('error', function (err) {
                    console.log(`TCP :: error : ${err}`);
                });

                stream.on('close', function (had_err) {
                    console.log(`TCP :: closed${had_err ? ' : had error' : ''}`);
                });

                stream.pause();

                const socket = net.connect(localPort, localAddr, function () {
                    stream.pipe(socket);
                    socket.pipe(stream);
                    stream.resume();
                });
            })
            .on('error', function (err) {
                node.log(`SSH2::error : ${err}`)
            })
            .on('end', function () {
                node.log('SSH2::end')
            })
            .on('close', function (had_err) {
                node.status({ fill: "red", shape: "dot", text: "stopped" });
                node.log(`SSH2::closed${had_err ? ' : had error' : ''}`)
                node.serving = false;
            })
        return conn;
    }

    function writeTunnelServerLog(node, info) {
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
        const privateKey = node.privateKey;

        var sshPort = args.SshPort;
        var sshServer = args.SshServer || 'tunn@tunnels.semilimes.net';
        var sshUsername = args.SshUsername || 'tunn';
        var tunnelUrl = args.TunnelUrl || `https://${args.SiteId}.tunnels.semilimes.net`;
        var remotePort = args.RemotePort;

        const sshConn = createConnection(node, localHost, localPort);

        sshConn.on('ready', function () {
            sshConn.forwardIn('0.0.0.0', remotePort, function (err) {
                if (err) {
                    throw err;
                };
                node.log('SSH2::started forwarding');
            })
        })

        sshConn.connect({ host: sshServer, port: sshPort, username: sshUsername, privateKey: privateKey });

        node.sshConn = sshConn;
        node.status({ fill: "green", shape: "dot", text: "connected" });
        node.serving = true;

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
        
        if (node.sshConn) {
            node.sshConn.end();
            node.sshConn = null;
        }

        node.status({ fill: "red", shape: "dot", text: "stopped" });

        smeConnector.postMessage({
            Type: "client",
            TypeID: SmeTunnelClientMessageTypeID,
            Command: 'disconnect',
            TunnelName: node.name,
        });
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
        node.port = config.port && parseInt(config.port);
        node.publicKey = getCA(node.id);
        node.privateKey = getPrivateKey(node.id);

        node.serving = false;
        node.sshConn = null;

        //	Listener for message...
        smeConnector.addMessageListener(smeMsg => {
            //  Check if it is Tunnel Form Submission.
            if ((smeMsg.TypeID || '').toUpperCase() == SmeTunnelServerMessageTypeID) {
                if (smeMsg.TunnelName == node.name) {
                    var command = (smeMsg.Command || '').toUpperCase();
                    node.log(`Received server command: ${command}`);

                    switch (command) {
                        case 'INITIALIZED':
                            var connectionInfo = smeMsg.ConnectionInfo || {};
                            startTunnel(node, {
                                SshPort: connectionInfo.SshPort,
                                SshServer: connectionInfo.SshServer,
                                SshUsername: connectionInfo.SshUsername,
                                RemotePort: connectionInfo.RemotePort,
                                TunnelUrl: connectionInfo.TunnelUrl
                            });
                            break;
                        default:
                            break;
                    }
                }
            }
        });

        //  Send message to semilimes to create tunnel.
        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            if (node.name && node.host && node.port) {
                switch ((msg.Command || '').toUpperCase()) {
                    case 'START':
                        node.log(`Initialize tunnel: ${node.name}`);
                        smeConnector.postMessage({
                            Type: "client",
                            TypeID: SmeTunnelClientMessageTypeID,
                            Command: 'initialize',
                            TunnelName: node.name,
                            RemotePort: node.port,  // Suggestion only.
                            PublicKey: node.publicKey,
                        });

                        send(msg, false);
                        break;

                    case 'STOP':
                        stopTunnel(node);

                        node.log(`Disconnect tunnel: ${node.name}`);
                        smeConnector.postMessage({
                            Type: "client",
                            TypeID: SmeTunnelClientMessageTypeID,
                            Command: 'disconnect',
                            TunnelName: node.name,
                        });

                        send(msg, false);
                        break;

                    default:
                        node.log(`Invalid tunnel command: ${msg.Command}`);
                        break;
                }
            }

            done && done();
        });
    };

    RED.nodes.registerType("sme-sshtunnel", SmeNode);
};