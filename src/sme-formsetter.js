"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.reference = config.reference;
        this.value = config.value;
        this.valueType = config.valueType;

        if (!this.reference)
            return;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var formValues = null;
            switch (node.valueType) {
                case 'msg':
                    formValues = msg[node.value];
                    break;
                case 'flow':
                    formValues = node.context().flow.get(node.value);
                    break;
                case 'global':
                    formValues = node.context().global.get(node.value);
                    break;
                case 'json':
                    formValues = JSON.parse(node.value);
                    break;
            }

            if (formValues) {
                var setFormMsg = {
                    Type: 'client',
                    TypeID: '197AD780-BDB0-4DA8-995C-9A64EB53B443',
                    Reference: node.reference,
                    State: formValues,
                    DeliveryOption: {
                        Mode: 'ReplaceByReference'
                    }
                };

                var core = new Core();
                var smeHelper = new core.SmeHelper();
                var smeFormMsg = smeHelper.addSendingMsg(msg, setFormMsg);                
            }

            send(msg, false);
            
            done && done();
        });
    };

    RED.nodes.registerType("sme-formsetter", SmeNode);
};