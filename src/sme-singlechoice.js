"use strict";

module.exports = function (RED) {

    function SmeSingleChoiceNode(config) {
        RED.nodes.createNode(this, config);
        this.label = config.label;
        this.name = config.name;;
        this.options = [config.choice1, config.choice2, config.choice3, config.choice4, config.choice5, config.choice6]
            .filter(x => x != null && x != '')
            .map(x => {
                return { Text: x };
            });

        var node = this;

        node.on('input', function (msg, send, done) {
            if (this.options.length == 0) {
                send = send || function () { node.send.apply(node, arguments) };

                var formItemLabel = node.label;
                var formReference = node.name;

                var m = {
                    Type: 'chat',
                    TypeID: '457d1d4f-c982-4caf-bcc4-4b435860efa3',
                    Body: formItemLabel,
                    FormItems: [
                        {
                            FormTypeID: '4db40f80-4c25-454b-bdb4-330a05285d71',
                            FormTypeConfig: {
                                Title: formItemLabel,
                                Options: node.options
                            },
                            FormRequired: true,
                            FormReference: 'value',
                            AutoSubmit: true
                        }
                    ],
                    FormReference: formReference
                };

                msg.payload = m;

                send(msg, false);
            }
            else {
                node.status({ fill: "red", shape: "ring", text: "Invalid options!" });
            }

            done && done();
        });
    };

    RED.nodes.registerType("sme-singlechoice", SmeSingleChoiceNode);
};