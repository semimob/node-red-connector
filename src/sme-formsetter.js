"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.formReference = config.formReference;
        this.formValue = config.formValue && JSON.parse(config.formValue);

        if (!(this.formReference && this.formValue))
            return;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            msg.payload = {
                Type: 'client',
                TypeID: '197AD780-BDB0-4DA8-995C-9A64EB53B443',
                FormReference: node.formReference,
                State: node.formValue
            };

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-formsetter", SmeNode);
};