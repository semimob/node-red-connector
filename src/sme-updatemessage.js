"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.option = config.option;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            if (msg.payload != null && typeof (msg.payload) == 'object') {
                switch (node.option)
                {
                    case 'UpdateLastMessage': {
                        msg.payload.Request = {
                            MessageIndex: -1,
                            NewTypeID: msg.payload.TypeID
                        };

                        msg.payload.TypeID = '3B6A45A1-7142-498C-A641-607EEBDE3C06';

                        send(msg, false);
                        break;
                    }
                    case 'UpdateByReference': {
                        msg.payload.Request = {
                            MessageReference: msg.payload.Reference,
                            NewTypeID: msg.payload.TypeID
                        };

                        msg.payload.TypeID = '3B6A45A1-7142-498C-A641-607EEBDE3C06';

                        send(msg, false);
                        break;
                    }
                    default: {
                        node.status({ fill: 'red', shape: 'ring', text: 'Invalid option.' })
                        break;
                    }
                }                
            }
            else {
                node.status({ fill: 'red', shape: 'ring', text: 'Invalid payload.' })
            }

            done && done();
        });
    };

    RED.nodes.registerType("sme-updatemessage", SmeNode);
};