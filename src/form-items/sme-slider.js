"use strict";

const Core = require('./../sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.title = config.title;
        this.min = config.min;
        this.max = config.max;
        this.step = config.step;
        this.required = config.required;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            var smeFormMsg = smeHelper.getOrAddSendingFormMsg(msg);

            smeFormMsg.FormItems.push({
                FormTypeID: 'ac6fcee7-b165-42c1-b1e0-fdc4aba22195',
                FormTypeConfig: {
                    Title: node.title,
                    Min: this.min || 0,
                    Max: this.max || 100,
                    DivisionStep: this.step || 5
                },
                FormRequired: smeFormMsg.FormItems.length == 0 || (node.required == 1),
                FormReference: node.name
            });
            
            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-slider", SmeNode);
};