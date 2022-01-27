"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.receiverName = config.receiverName;
        this.action = config.action;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            if (msg.payload != null && typeof (msg.payload) == 'object') {
                msg.payload.ReceiverName = node.receiverName;

                switch (node.action || '') {
                    case 'UpdateByReference':
                        if (msg.payload.Reference) {
                            msg.payload.Request = {
                                MessageReference: msg.payload.Reference,
                                NewTypeID: msg.payload.TypeID
                            };

                            msg.payload.TypeID = '3B6A45A1-7142-498C-A641-607EEBDE3C06';
                        }
                        break;
                    case 'UpdateLastMessage':
                        msg.payload.Request = {
                            MessageIndex: -1,
                            NewTypeID: msg.payload.TypeID
                        };

                        msg.payload.TypeID = '3B6A45A1-7142-498C-A641-607EEBDE3C06';
                        break;
                }
            }
            
            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-sendingoption", SmeNode);
};