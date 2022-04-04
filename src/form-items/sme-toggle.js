"use strict";

const Core = require('./../sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.title = config.title;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            var smeFormMsg = smeHelper.getOrAddFormMsg(msg);

            smeFormMsg.FormItems.push({
                FormTypeID: 'c23b3dc6-fa62-45fb-850b-3b2196fb0337',
                FormTypeConfig: {
                    Title: node.title,
                },
                FormRequired: false,
                FormReference: node.name
            });

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-toggle", SmeNode);
};