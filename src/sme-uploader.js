"use strict";

const smeFilepicker = require('./form-items/sme-filepicker.js');
const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.content = config.content;
        this.contentType = config.contentType;

        var node = this;

        var smeConnector = config.connector && RED.nodes.getNode(config.connector);
        if (!smeConnector)
            return;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();

            var fileContent = smeHelper.getNodeConfigValue(node, msg, node.contentType, node.content);

            var apiData = {};

            if (msg.payload) {
                apiData.FileName = msg.filename;

                if (Buffer.isBuffer(fileContent)) {
                    apiData.Content = fileContent.toString('base64');
                    apiData.Encoding = 'base64';
                    msg.payload = null;
                }
                else if (typeof (msg.payload) == 'string') {
                    apiData.Content = fileContent;
                    apiData.Encoding = "utf8"
                    msg.payload = null;
                }
                else {
                    node.status({ fill: "red", shape: "ring", text: "Message payload must be Binary or UTF8!" });
                }
            }

            if (apiData.Content) {
                var promise = smeConnector.callApi('147056DF-B5EE-4D6C-9B35-737644372F48', apiData);

                promise.then(
                    value => {
                        //node.log('Uploaded result: ', value);
                        //  Set payload to the returned message.
                        var uploadedFile = value && value.UploadedFile;

                        if (uploadedFile != null) {
                            msg.payload = uploadedFile;
                        }

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