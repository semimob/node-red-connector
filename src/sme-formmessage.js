"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.reference = config.reference;
        this.formStatus = config.formStatus == '1';
        this.submitButtonText = config.submitButtonText;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            var smeFormMsg = smeHelper.getOrAddSendingFormMsg(msg);

            smeFormMsg.Type = 'chat';
            smeFormMsg.TypeID = '457d1d4f-c982-4caf-bcc4-4b435860efa3';

            smeFormMsg.Reference = node.reference;
            smeFormMsg.FormStatus = node.formStatus ? 1 : 0;
            smeFormMsg.FormItems = smeFormMsg.FormItems || [];
            smeFormMsg.DisabledSubmitButton = node.submitButtonText ? false : true;
            smeFormMsg.FormSubmitButtonLabel = node.submitButtonText;
            
            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-form", SmeNode);
};