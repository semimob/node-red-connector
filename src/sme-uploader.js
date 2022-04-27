"use strict";

const smeFilepicker = require('./form-items/sme-filepicker.js');
const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;

        var smeConnector = config.connector && RED.nodes.getNode(config.connector);
        if (!smeConnector)
            return;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var smeMsg = {
                Type: 'client',
                TypeID: '17F90014-424C-4D2D-984A-758A4B79E265',
            };

            if (msg.payload) {
                smeMsg.FileName = msg.filename;

                if (Buffer.isBuffer(msg.payload)) {
                    smeMsg.Content = msg.payload.toString('base64');
                    smeMsg.Encoding = 'base64';
                    msg.payload = null;
                }
                else if (typeof (msg.payload) == 'string') {
                    smeMsg.Content = msg.payload;
                    smeMsg.Encoding = "utf8"
                    msg.payload = null;
                }
                else {
                    node.status({ fill: "red", shape: "ring", text: "Message payload must be Binary or UTF8!" });
                }
            }

            if (smeMsg.Content) {
                var promise = smeConnector.sendMessage(smeMsg);

                promise.then(
                    value => {
                        //  Set payload to the returned message.
                        msg.payload = value && value.Message;
                        send(msg, false);
                        done && done(value);
                    },
                    reason => {
                        msg.error = reason;
                        send(msg, false);
                        done && done(reason);
                    }
                );
            }
            else {
                send(msg, false);
                done && done();
            }
        });
    };

    RED.nodes.registerType("sme-uploader", SmeNode);
};