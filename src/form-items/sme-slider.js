"use strict";

const Core = require('./../sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.title = config.title;
        this.min = parseInt(config.min);
        this.max = parseInt(config.max);
        this.step = parseInt(config.step);
        this.value = config.value;
        this.valueType = config.valueType;
        this.required = config.required == "1";

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            var smeFormMsg = smeHelper.getOrAddSendingFormMsg(msg);

            var formValue = smeHelper.getNodeConfigValue(node, msg, node.valueType, node.value);
            formValue = parseInt(formValue);

            smeFormMsg.FormItems.push({
                FormTypeID: 'ac6fcee7-b165-42c1-b1e0-fdc4aba22195',
                FormTypeConfig: {
                    Title: node.title,
                    Min: this.min || 0,
                    Max: this.max || 100,
                    DivisionStep: this.step || 5
                },
                FormRequired: smeFormMsg.FormItems.length == 0 || (node.required == 1),
                FormValue: formValue,
                Reference: node.name,
                AutoSubmit: smeFormMsg.DisabledSubmitButton == true,
            });
            
            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-slider", SmeNode);
};