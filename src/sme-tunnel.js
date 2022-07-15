module.exports = function(RED) {
    const axios = require('axios').default;
    const { Client } = require('ssh2');
    const net = require('net');
    const fs = require('fs');

    const username = 'tunn';
    const tunnelHost = 'tunnels.semilimes.net';
    const sshPort = 22;

    function createConnection(node, localAddr, localPort) {
        const conn = new Client();
        conn
            .on('connect', function() {
                node.log('SSH Connection :: connect')
            })
            .on('tcp connection', function(info, accept) {
                const stream = accept();

                stream.on('error', function(err) {
                    console.log(`TCP :: error : ${err}`);
                });

                stream.on('close', function(had_err) {
                    console.log(`TCP :: closed${had_err ? ' : had error' : ''}`);
                });

                stream.pause();

                const socket = net.connect(localPort, localAddr, function() {
                    stream.pipe(socket);
                    socket.pipe(stream);
                    stream.resume();
                });
            })
            .on('error', function(err) {
                node.log(`SSH Connection :: error : ${err}`)
            })
            .on('end', function() {
                node.log('SSH Connection :: end')
            })
            .on('close', function(had_err) {
                node.status({fill:"red",shape:"dot",text:"stopped"});
                node.log(`SSH Connection :: closed${had_err ? ' : had error' : ''}`)
                node.serving = false;
            })
        return conn;
    }
    

    function startTunnel(node, msg) {
        node.log("Start establishing connection using ssh");

        const privateKey = fs.readFileSync('sme_rsa', 'utf8');
        const siteId = node.siteSettings.credentials.siteId;
        const host = node.siteSettings.credentials.host;
        const localPort = node.siteSettings.credentials.port;
        const remotePort = node.siteSettings.remotePort;

        const sshConn = createConnection(node, host, localPort);
        const connSettings = {
            host: tunnelHost,
            port: sshPort,
            username,
            privateKey
        };

        sshConn.on('ready', function() {
            sshConn.forwardIn('0.0.0.0', remotePort, function(err) {
                if (err) {
                    throw err;
                };
                node.log('SSH Connection :: started forwarding');
            })
        })

        sshConn.connect(connSettings);
        node.sshConn = sshConn;
        node.status({fill:"green",shape:"dot",text:"connected"});
        node.serving = true;

        axios.post(`https://${tunnelHost}/api/sites/${siteId}/connect/`);

        msg.tunnelurl = `https://${siteId}.${tunnelHost}`;
        node.send(msg);

        node.on('close', function() {
            stopServing(node);
        });
    }

    function startServing(node, msg) {
        if (!node.serving) {
            const siteId = node.siteSettings.credentials.siteId;
            node.log(`Trying to allocate remote port for site: ${siteId}`);
            axios.post(`https://${tunnelHost}/api/sites/${siteId}/request_port/`)
            .then(response => {
                // The port is remote for client but local for the server
                node.siteSettings.remotePort = response.data.local_port;
                startTunnel(node, msg);
            })
            .catch((error) => {
                node.error('Port allocating error: ' + error);
            }
            )
        }
    }

    function stopServing(node) {
        if (node.serving) {
            const siteId = node.siteSettings.credentials.siteId;
            node.log("Aborting tunnel connection");
            node.sshConn.end();
            axios.post(`https://${tunnelHost}/api/sites/${siteId}/disconnect/`)
        }
    }


    function TunnelNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.siteSettings = RED.nodes.getNode(config.site)
        node.serving = false;
        node.sshProcess = null;

        node.log(`Site settings`);
        node.log(node.siteSettings);

        node.status({fill:"orange",shape:"dot",text:"connecting"});

        node.on('input', function(msg) {
            const { command } = msg;
            if (command) {
                switch (command) {
                    case 'start':
                        startServing(node, msg);
                        break;
                    case 'stop':
                        stopServing(node);
                        break;
                    default:
                        node.log(`Uknown command: ${command}`)
                }
            }
        });
    }

    RED.nodes.registerType("sme-tunnel", TunnelNode);
};