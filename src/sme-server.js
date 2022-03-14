module.exports = function (RED) {
    "use strict";

    function SmeNode(config) {
        RED.nodes.createNode(this, config);
        this.host = config.host;
    }

    RED.nodes.registerType("sme-server", SmeNode, {
        settings: {
            smeServerHost: {
                value: "cloud.semilimes.net",
                exportable: true
            }
        }
    });
};