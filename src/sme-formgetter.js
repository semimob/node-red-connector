"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.message = config.message;
        this.storage = config.storage;
        this.storageType = config.storageType;

        if (!(this.storage && this.storageType))
            return;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var form = typeof (msg.payload) == 'object' ? (msg.payload || {}) : {};

            var isFormOrSubmitMessage = (form.Type || '').toLowerCase() == 'chat'
                && ((form.TypeID || '').toLowerCase() in ['457d1d4f-c982-4caf-bcc4-4b435860efa3', '68c87543-27d7-49c6-a56f-ebce74ca8275'])
                && Array.isArray(form.FormItems);

            if (isFormOrSubmitMessage) {
                var isMessageMatched = !node.message || node.message == form.FormReference;
                if (isMessageMatched) {
                    var values = {};

                    for (let i = 0; i < form.FormItems.length; i++) {
                        var formItem = form.FormItems[i];
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

    RED.nodes.registerType("sme-formgetter", SmeNode);
};