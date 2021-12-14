module.exports = function (RED) {
    "use strict";

    function SmeServerNode(config) {
        RED.nodes.createNode(this, config);
        this.host = config.host;
        this.port = config.port;
    }

    RED.nodes.registerType("sme-server", SmeServerNode, {
        settings: {
            smeServerHost: {
                value: "cloud.semilimes.net",
                exportable: true
            },
            smeServerPort: {
                value: "",
                exportable: true
            }
        }
    });
};