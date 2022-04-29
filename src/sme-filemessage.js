"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.files = config.files;
        this.filesType = config.filesType;
        this.reference = config.reference;

        var node = this;

        node.on('input', function (msg, send, done) {
            if (node.files) {
                send = send || function () { node.send.apply(node, arguments) };

                var core = new Core();
                var smeHelper = new core.SmeHelper();

                var files = smeHelper.getNodeConfigValue(node, msg, node.filesType, node.files);
                //node.log('files: ', files);
                if (files) {
                    node.log('config files: ', files);
                    //  If not an array.
                    if (Array.isArray(files) == false) {
                        //  It could be output of sme-uploader node which is a file.
                        files = [files];
                        //node.log('file-chat-message-files: ', files);
                    }

                    if (Array.isArray(files)) {
                        //  Make a copy of the fileID array for safety.
                        files = files.filter(x => x.FileID).map(x => { return { FileID: x.FileID }; });
                        //node.log('filtered files: ', files);
                        if (files.length > 0) {
                            var smeMsg = {
                                Type: 'chat',
                                TypeID: '1403842A-BC4F-4FDA-BFB3-2DA5A30833D6',
                                Reference: node.reference,
                                Files: files,
                            };

                            var smeFormMsg = smeHelper.addSendingMsg(msg, smeMsg);
                        }
                    }
                }
            }

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-filemessage", SmeNode);
};