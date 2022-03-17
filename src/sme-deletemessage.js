"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.option = config.option;
        this.messageId = config.messageId;
        this.messageIdType = config.messageIdType;
        this.reference = config.reference;
        this.referenceType = config.referenceType;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            switch (node.option) {
                case 'DeleteByID':
                    var messageIDValue = null;
                    switch (node.messageIdType) {
                        case 'msg':
                            messageIDValue = msg[node.messageId];
                            break;
                        case 'flow':
                            messageIDValue = node.context().flow.get(node.messageId);
                            break;
                        case 'global':
                            messageIDValue = node.context().global.get(node.messageId);
                            break;
                        default:
                            messageIDValue = msg.payload && msg.payload.MessageID;
                            break;
                    }

                    if (messageIDValue) {
                        var deletionRequestMsg = {
                            Type: 'client',
                            TypeID: '63F5A289-1F97-489B-B132-F0D8310B2808',
                            DeleteMessageID: messageIDValue,
                        };

                        send({ payload: deletionRequestMsg }, false);
                    }

                    break;
                case 'DeleteByReference':
                    var refValue = null;
                    switch (node.referenceType) {
                        case 'str':
                            refValue = node.reference;
                            break;
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
                        var deletionRequestMsg = {
                            Type: 'client',
                            TypeID: '63F5A289-1F97-489B-B132-F0D8310B2808',
                            MessageReference: refValue
                        };

                        send({ payload: deletionRequestMsg }, false);
                    }

                    break;
                case 'DeleteAll':
                    var deletionRequestMsg = {
                        Type: 'client',
                        TypeID: '63F5A289-1F97-489B-B132-F0D8310B2808',
                        DeleteAllMessages: true,
                    };

                    send({ payload: deletionRequestMsg }, false);

                    break;
            }

            done && done();
        });
    };

    RED.nodes.registerType("sme-deletemessage", SmeNode);
};