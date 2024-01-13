"use strict";

const Core = require('./../sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.title = config.title;
        this.value = config.value;
        this.valueType = config.valueType;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            var smeFormMsg = smeHelper.getOrAddSendingFormMsg(msg);

            var formValue = smeHelper.getNodeConfigValue(node, msg, node.valueType, node.value);
            formValue = formValue == true ? 1 : 0;

            smeFormMsg.FormItems.push({
                FormTypeID: 'c23b3dc6-fa62-45fb-850b-3b2196fb0337',
                FormTypeConfig: {
                    Title: node.title,
                    Value: formValue,
                },
                FormRequired: false,
                FormValue: formValue,
                Reference: node.name,
                AutoSubmit: smeFormMsg.DisabledSubmitButton == true,
            });

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-toggle", SmeNode);
};