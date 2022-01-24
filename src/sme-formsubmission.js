"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.reference = config.reference;
        this.storage = config.storage;
        this.storageType = config.storageType;

        if (!(this.storage && this.storageType))
            return;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var formMsg = typeof (msg.payload) == 'object' ? (msg.payload || {}) : {};

            var isFormSubmitMessage = (formMsg.Type || '').toLowerCase() == 'chat'
                && ((formMsg.TypeID || '').toLowerCase() == '68c87543-27d7-49c6-a56f-ebce74ca8275')
                && Array.isArray(formMsg.FormItems);

            if (isFormSubmitMessage) {
                var isMessageMatched = !node.reference || node.reference == formMsg.Reference;
                if (isMessageMatched) {
                    var values = {};

                    for (let i = 0; i < formMsg.FormItems.length; i++) {
                        var formItem = formMsg.FormItems[i];
                        values['' + (formItem.FormReference || i)] = formItem.FormValue;
                    }

                    switch (node.storageType) {
                        case 'msg':
                            msg[node.storage] = values;
                            break;
                        case 'flow':
                            node.context().flow.set(node.storage, values);
                            break;
                        case 'global':
                            node.context().global.set(node.storage, values);
                            break;
                    }
                }
            }

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-formsubmission", SmeNode);
};