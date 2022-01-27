"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.reference = config.reference;

        if (!this.reference)
            return;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var refValue = null;
            switch (node.valueType) {
                case 'str':
                    refValue = node.reference;
                case 'msg':
                    refValue = msg[node.reference];
                    break;
                case 'flow':
                    refValue = node.context().flow.get(node.reference);
                    break;
                case 'global':
                    refValue = node.context().global.get(node.reference);
                    break;
                default:
                    refValue = msg.payload && msg.payload.Reference;
                    break;
            }

            if (refValue) {
                var smeMsg = {
                    Type: 'client',
                    TypeID: '63F5A289-1F97-489B-B132-F0D8310B2808',
                    Request: {
                        MessageReference: refValue
                    }
                };

                send({ payload: smeMsg }, false);
            }

            done && done();
        });
    };

    RED.nodes.registerType("sme-deletemessage", SmeNode);
};