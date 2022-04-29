"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.reference = config.reference;
        this.storage = config.storage;
        this.storageType = config.storageType;

        if (!(this.storage && this.storageType))
            return;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            var smeReceivedMsg = smeHelper.getReceivedMsg(msg);

            var isFormSubmitMessage = smeReceivedMsg && (smeReceivedMsg.Type || '').toUpperCase() == 'CHAT'
                && ((smeReceivedMsg.TypeID || '').toLowerCase() == '68c87543-27d7-49c6-a56f-ebce74ca8275')
                && Array.isArray(smeReceivedMsg.FormItems);

            if (isFormSubmitMessage) {
                var formMsg = smeReceivedMsg;
                var isMessageMatched = !node.reference || node.reference == formMsg.Reference;
                if (isMessageMatched) {

                    var values = {};
                    for (let i = 0; i < formMsg.FormItems.length; i++) {
                        var formItem = formMsg.FormItems[i];
                        values['' + (formItem.Reference || i)] = formItem.FormValue;
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

                    send(msg, false);
                }
            }

            done && done();
        });
    };

    RED.nodes.registerType("sme-formsubmission", SmeNode);
};