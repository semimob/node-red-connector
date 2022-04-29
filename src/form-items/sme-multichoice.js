"use strict";

const Core = require('./../sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.title = config.title;
        this.options = [config.choice1, config.choice2, config.choice3, config.choice4, config.choice5, config.choice6]
            .filter(x => x != null && x != '')
            .map(x => {
                return { Text: x, Value: x };
            });
        this.required = config.required;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            if (this.options.length > 0) {
                var core = new Core();
                var smeHelper = new core.SmeHelper();
                var smeFormMsg = smeHelper.getOrAddSendingFormMsg(msg);

                smeFormMsg.FormItems.push({
                    FormTypeID: '7be4d759-fdfd-422b-bc18-582f5bee902d',
                    FormTypeConfig: {
                        Title: node.title,
                        Options: node.options
                    },
                    FormRequired: smeFormMsg.FormItems.length == 0 || (node.required == 1),
                    Reference: node.name
                });
            }
            else {
                node.status({ fill: "red", shape: "ring", text: "Invalid options!" });
            }

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-multichoice", SmeNode);
};