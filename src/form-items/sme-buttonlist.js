"use strict";

const Core = require('./../sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;;
        this.title = config.title;
        this.buttons = [config.button1, config.button2, config.button3, config.button4, config.button5, config.button6]
            .filter(x => x != null && x != '')
            .map(x => {
                return { Text: x, Value: x };
            });
        this.vertical = config.vertical;
        this.required = config.required;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            if (this.buttons.length > 0) {

                var core = new Core();
                var smeHelper = new core.SmeHelper();
                var smeFormMsg = smeHelper.getOrAddSendingFormMsg(msg);
                
                smeFormMsg.FormItems.push({
                    FormTypeID: 'f7b0e678-4d11-4016-8f71-224e6280f3a5',
                    FormTypeConfig: {
                        Title: node.title,
                        Buttons: node.buttons,
                        Direction: node.vertical,
                    },
                    FormRequired: smeFormMsg.FormItems.length == 0 || (node.required == 1),
                    Reference: node.name,
                    AutoSubmit: true,
                });
            }
            else {
                node.status({ fill: "red", shape: "ring", text: "Invalid buttons!" });
            }

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-buttonlist", SmeNode);
};