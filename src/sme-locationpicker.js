"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.title = config.title;
        this.buttonText = config.buttonText;
        this.currentLocationOnly = config.currentLocationOnly;
        this.required = config.required;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var m = typeof (msg.payload) == 'object' ? (msg.payload || {}) : {};

            m.Type = m.Type || 'chat';
            m.TypeID = m.TypeID || '457d1d4f-c982-4caf-bcc4-4b435860efa3';
            m.FormItems = m.FormItems || [];

            m.FormItems.push({
                FormTypeID: '20a0ce4b-a236-4e96-9629-45a3af5f62ea',
                FormTypeConfig: {
                    Title: node.title,
                    ButtonText: node.buttonText,
                    CurrentLocationOnly: node.currentLocationOnly == '1' ? 1 : 0
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

    RED.nodes.registerType("sme-locationpicker", SmeNode);
};