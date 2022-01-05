"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.message = config.message;

        if (!(this.storage && this.storageType))
            return;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-formsetter", SmeNode);
};