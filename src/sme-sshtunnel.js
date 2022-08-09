"use strict";

const { config } = require('process');
const { debug } = require('util');
const Core = require('./sme-core.js');

module.exports = function (RED) {
    const { Client } = require('ssh2');
    const forge = require('node-forge');
    const fs = require('fs');
    const net = require('net');

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

    function createConnection(node, clientAddr, clientPort) {
        const conn = new Client();

        conn.on('connect', function () {
            node.status({ fill: "green", shape: "dot", text: "connected" });
        })
        .on('tcp connection', function (info, accept) {
            const stream = accept();

            stream.on('error', function (err) {
                console.log(`TCP error: ${err}`);
            });

            stream.on('close', function () {
                console.log('TCP closed.');
            });

            //stream.on('data', (data) => {
            //    console.log('TCP :: DATA: ' + data);
            //});

            stream.pause();

            const socket = net.connect(clientPort, clientAddr, function () {
                stream.pipe(socket);
                socket.pipe(stream);
                stream.resume();
            });
        })
        .on('end', function () {
            node.log('SSH2 end.');
        })
        .on('close', function () {
            node.status({ fill: "red", shape: "dot", text: "stopped" });
        });

        return conn;
    }

    function writeTunnelServerLog(node, log) {
        if (node && log) {
            var smeTunnelMsg = {
                Type: "client",
                TypeID: SmeTunnelClientMessageTypeID,
                Command: 'info',
                TunnelName: node.id,
                Body: log,
            };

            node.log(log);
            node.smeConnector.postMessage(smeTunnelMsg);
        }
    }

    function startTunnel(node, args) {
        if (node.sshConn)
            return;

        node.log("Start establishing connection using ssh");

        const clientAddr = node.host;
        const clientPort = node.port;
        const privateKey = node.privateKey;

        var sshPort = args.SshPort;
        var sshServer = args.SshServer;
        var sshUsername = args.SshUsername;
        var tunnelUrl = args.TunnelUrl;
        var serverPort = args.ServerPort;

        node.log("Start tunnel")
        node.log("Remote port: " + serverPort)
        node.log("Local port: " + clientPort)

        const sshConn = createConnection(node, clientAddr, clientPort);

        sshConn.on('connect', function () {
            node.retry = null;
            writeTunnelServerLog(node, 'SSH2 connected.');

            node.send({
                TunnelStatus: 'started',
                TunnelName: node.name,
                TunnelUrl: tunnelUrl,
                ClientHost: clientAddr,
                ClientPort: clientPort,
                ServerPort: serverPort,
            }, false);
        })
        .on('ready', function () {
            sshConn.forwardIn('0.0.0.0', serverPort, function (err) {
                if (err) {
                    throw err;
                };

                writeTunnelServerLog(node, `SSH2 started with server port: ${serverPort}`);

                node.smeConnector.postMessage({
                    Type: "client",
                    TypeID: SmeTunnelClientMessageTypeID,
                    Command: 'connect',
                    TunnelName: node.id,
                });
            });
        })
        .on('error', function (err) {
            writeTunnelServerLog(node, `SSH2 error: ${err}`);
        })
        .on('close', function () {
            //  Remove current broken connection.
            node.sshConn = null;

            if (node.serving) {
                if (node.retryTimeout > 0 && node.retry > node.retryTimeout) {
                    node.retry = null;
                    node.serving = false;
                    writeTunnelServerLog(node, 'SSH reconnecting timeout!');
                    return;
                }

                //  Re-connect.
                node.retry = (node.retry || 0) + 1;
                var delay = node.retryInterval * 1000;

                setTimeout(() => {
                    writeTunnelServerLog(node, `SSH reconnecting (${node.retry})...`);

                    node.send({
                        TunnelStatus: 'connecting',
                        TunnelName: node.name,
                    }, false);

                    startTunnel(node, args);
                }, delay);
                return;
            }

            writeTunnelServerLog(node, 'SSH closed.');
        });

        node.sshConn = sshConn;

        sshConn.connect({ host: sshServer, port: sshPort, username: sshUsername, privateKey: privateKey });

        node.on('close', function () {
            stopTunnel(node);
        });
    }
    
    function stopTunnel(node) {
        var sshConn = node.sshConn;
        node.sshConn = null;

        if (sshConn) {
            sshConn.end();
        }

        node.status({ fill: "red", shape: "dot", text: "stopped" });

        node.send({
            TunnelStatus: 'stopped',
            TunnelName: node.name,
        }, false);

        smeConnector.postMessage({
            Type: "client",
            TypeID: SmeTunnelClientMessageTypeID,
            Command: 'disconnect',
            TunnelName: node.id,
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
        node.retryInterval = (config.retryInterval && parseInt(config.retryInterval)) || 10;
        node.retryTimeout = (config.retryTimeout && parseInt(config.retryTimeout)) || 0;
        node.publicKey = getCA(node.id);
        node.privateKey = getPrivateKey(node.id);

        node.sshConn = null;

        //	Listener for message...
        smeConnector.addMessageListener(smeMsg => {
            //  Check if it is Tunnel Form Submission.
            if ((smeMsg.TypeID || '').toUpperCase() == SmeTunnelServerMessageTypeID) {
                if (smeMsg.TunnelName == node.id) {
                    var command = (smeMsg.Command || '').toUpperCase();
                    node.log(`Received server command: ${command}`);

                    switch (command) {
                        case 'INITIALIZED':
                            var connectionInfo = smeMsg.ConnectionInfo || {};
                            startTunnel(node, {
                                SshPort: connectionInfo.SshPort,
                                SshServer: connectionInfo.SshServer,
                                SshUsername: connectionInfo.SshUsername,
                                ServerPort: connectionInfo.ServerPort,
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

            node.log("Command: " + msg.Command);

            if (node.host && node.port) {
                switch ((msg.Command || '').toUpperCase()) {
                    case 'START':
                        node.serving = true;

                        node.log(`Initialize tunnel: ${node.id}`);
                        this.smeConnector.postMessage({
                            Type: "client",
                            TypeID: SmeTunnelClientMessageTypeID,
                            Command: 'initialize',
                            TunnelName: node.id,
                            ClientPort: node.port,
                            PublicKey: node.publicKey,
                            Description: node.name,
                        });

                        break;

                    case 'STOP':
                        node.serving = false;

                        stopTunnel(node);

                        node.log(`Stop tunnel: ${node.id}`);
                        this.smeConnector.postMessage({
                            Type: "client",
                            TypeID: SmeTunnelClientMessageTypeID,
                            Command: 'disconnect',
                            TunnelName: node.id,
                        });

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