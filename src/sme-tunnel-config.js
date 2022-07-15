module.exports = function(RED) {
    const axios = require('axios').default;
    const forge = require('node-forge');
    const fs = require('fs');

    function generateCA() {
        const rsa = forge.pki.rsa;

        const keypair = rsa.generateKeyPair({bits: 4096});
        const sshPubKey = forge.ssh.publicKeyToOpenSSH(keypair.publicKey);
        const sshPrivateKey = forge.ssh.privateKeyToOpenSSH(keypair.privateKey);

        fs.writeFileSync('sme_rsa', sshPrivateKey);
        fs.writeFileSync('sme_rsa.pub', sshPubKey);
        fs.chmodSync('sme_rsa', '400')
    }
    
    function getCA() {
        if (! (fs.existsSync('sme_rsa') && fs.existsSync('sme_rsa.pub'))) {
            generateCA();
        }

        const pubKey = fs.readFileSync('sme_rsa.pub', 'utf-8');
        return pubKey
    }


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

    RED.httpAdmin.get('/sme-tunnels/get-certificate', function(req, res) {
        const pubKey = getCA();
        res.json({pubKey});
    })

}