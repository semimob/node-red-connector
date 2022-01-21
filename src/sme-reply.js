"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
       
        var node = this;

        node.on('input', function (msg, send, done) {
            if (msg.payload != null && typeof (msg.payload) == 'object') {
                var conversationID = msg.payload['ConversationID'];
                if (conversationID) {
                    send = send || function () { node.send.apply(node, arguments) };

                    var reply = {
                        'Type': 'chat',
                        'ConverationID': conversationID,
                    };

                    send(reply, false);
                }
            }

            done && done();
        });
    };

    RED.nodes.registerType("sme-reply", SmeNode);
};