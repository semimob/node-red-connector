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

            //  Check if TypeID match UPPERCASE TypeID of the sign of this form message creation.
            if (smeFormMsg.TypeID == '457D1D4F-C982-4CAF-BCC4-4B435860EFA3') {
                smeFormMsg = {};
                smeHelper.addSendingMsg(msg, smeFormMsg);
            }

            smeFormMsg.Type = 'chat';
            smeFormMsg.TypeID = '457D1D4F-C982-4CAF-BCC4-4B435860EFA3'; //  Use UPPERCASE TypeID as the sign of this form message creation.

            smeFormMsg.Reference = node.reference;
            smeFormMsg.FormStatus = node.formStatus ? 1 : 0;
            smeFormMsg.FormItems = smeFormMsg.FormItems || [];
            smeFormMsg.DisabledSubmitButton = node.submitButtonText ? false : true;
            smeFormMsg.FormSubmitButtonLabel = node.submitButtonText;

            smeFormMsg.FormItems.forEach(formItem => {
                formItem.AutoSubmit = smeFormMsg.DisabledSubmitButton == true;
            });
            
            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-form", SmeNode);
};