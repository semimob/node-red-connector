module.exports = function(RED) {
    const axios = require('axios').default;

    function TunnelConfigNode(n) {
        RED.nodes.createNode(this, n);
        this.host = n.host;
        this.port = n.port;
        this.remotePort = '';
    }
    RED.nodes.registerType("sme-tunnel-config", TunnelConfigNode, {
        credentials: {
            host: {type: "text"},
            port: {type: "number"},
            siteId: {type: "text"}
        }
    });

    RED.httpAdmin.post('/sme-tunnels/create-site', function(req, res) {
        axios.post('https://tunnels.semilimes.net/api/sites/', req.body)
        .then(response => {
            res.json(response.data);
        })
    })
}