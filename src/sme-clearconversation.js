"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.reference = config.reference;
        this.option = config.option;

        if (!this.reference)
            return;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var smeMsg = {
                Type: 'client',
                TypeID: '63F5A289-1F97-489B-B132-F0D8310B2808',
                Request: {
                    MessageReference: refValue
                }
            };

            send({ payload: smeMsg }, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-clearconversation", SmeNode);
};