module.exports = function(RED) {
    const axios = require('axios').default;

    const child_process = require('child_process');

    function startTunnel(node, msg) {
        node.log("Start establishing connection using ssh");

        const siteId = node.siteSettings.credentials.siteId;
        const host = node.siteSettings.credentials.host;
        const localPort = node.siteSettings.credentials.port;
        const remotePort = node.siteSettings.remotePort;
        const params = ['-o StrictHostKeyChecking=no', '-R', `${remotePort}:${host}:${localPort.toString()}`, 'tunn@tunnels.semilimes.net', '-N'];

        sshprocess = child_process.spawn("ssh", params);
        node.status({fill:"green",shape:"dot",text:"connected"});
        node.sshProcess = sshprocess;
        node.serving = true;

        axios.post(`https://tunnels.semilimes.net/api/sites/${siteId}/connect/`);

        msg.tunnelurl = `https://${siteId}.tunnels.semilimes.net`;
        node.send(msg);

        sshprocess.on('close', (code, signal) => {
            node.status({fill:"red",shape:"dot",text:"stopped"});
            node.log("Tunnel connection aborted");
            node.serving = false;
        });

        node.on('close', function() {
            stopServing(node);
        });
    }

    function startServing(node, msg) {
        if (!node.serving) {
            const siteId = node.siteSettings.credentials.siteId;
            node.log(`Trying to allocate remote port for site: ${siteId}`);
            axios.post(`https://tunnels.semilimes.net/api/sites/${siteId}/request_port/`)
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
            node.status({fill:"red",shape:"dot",text:"stopped"});
            node.log("Aborting tunnel connection");
            sshprocess.kill();
            axios.post(`https://tunnels.semilimes.net/api/sites/${siteId}/disconnect/`)
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