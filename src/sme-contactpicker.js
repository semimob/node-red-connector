"use strict";

module.exports = function (RED) {

    function SmeContactPickerNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.title = config.title;
        this.buttonText = config.buttonText;
        this.required = config.required;
        
        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var m = typeof (msg.payload) == 'object' ? (msg.payload || {}) : {};

            m.Type = m.Type || 'chat';
            m.TypeID = m.TypeID || '457d1d4f-c982-4caf-bcc4-4b435860efa3';
            m.FormItems = m.FormItems || [];

            m.FormItems.push({
                FormTypeID: 'e4044aec-b7fd-406e-a043-e08e166f7434',
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

    RED.nodes.registerType("sme-contactpicker", SmeContactPickerNode);
};