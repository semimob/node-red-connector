"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
       
        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            if (msg.payload != null && typeof (msg.payload) == 'object') {
                delete msg.payload['MessageID'];
            }
            
            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-recycler", SmeNode);
};