"use strict";

module.exports = function (RED) {

    function SmeDatePickerNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.title = config.title;
        this.buttonText = config.buttonText;
        this.required = config.required;
        this.formStatus = config.formStatus;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var m = typeof (msg.payload) == 'object' ? (msg.payload || {}) : {};

            m.Type = 'chat';
            m.TypeID = '457d1d4f-c982-4caf-bcc4-4b435860efa3';
            m.Body = node.title || node.name || m.Body;
            m.FormReference = m.FormReference || node.name;
            m.FormStatus = node.formStatus ? 1 : 0;
            m.FormItems = m.FormItems || [];

            m.FormItems.push({
                FormTypeID: '242b5a3b-c1af-4663-bd97-e296e3db4d2f',
                FormTypeConfig: {
                    Title: node.title,
                    ButtonText: node.buttonText
                },
                FormValue: node.value,
                FormRequired: m.FormItems.length == 0 || (node.required == 1),
                FormReference: node.name
            });
            
            msg.payload = m;

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-datepicker", SmeDatePickerNode);
};