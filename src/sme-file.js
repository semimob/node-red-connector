"use strict";

module.exports = function (RED) {

    function SmeFileNode(config) {
        RED.nodes.createNode(this, config);
        this.file = config.file;
        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-file", SmeFileNode);
};