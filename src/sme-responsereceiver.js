"use strict";

module.exports = function (RED) {

    function SmeResponseReceiverNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.message = config.message;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var form = typeof (msg.payload) == 'object' ? (msg.payload || {}) : {};

            var isFormSubmit = (form.Type || '').toLowerCase() == 'chat'
                && ((form.TypeID || '').toLowerCase() != '68c87543-27d7-49c6-a56f-ebce74ca8275')
                && Array.isArray(form.FormItems);

            if (isFormSubmit) {
                console.log('submit');
                var isMessageMatched = !node.message || node.message == form.FormReference;
                if (isMessageMatched) {
                    console.log('matched');
                    var m = {};

                    for (let i = 0; i < form.FormItems.length; i++) {
                        var formItem = form.FormItems[i];
                        m['' + (formItem.FormReference || i)] = formItem.FormValue;
                    }

                    msg.payload = m;

                    send(msg, false);
                }
            }
            console.log('end');

            done && done();
        });
    };

    RED.nodes.registerType("sme-responsereceiver", SmeResponseReceiverNode);
};