"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.reference = config.reference;
        this.url = config.url;
        this.urlType = config.urlType;
        this.viewSize = config.viewSize || '1:2';
        this.enableFullScreen = config.enableFullScreen;
        this.isUserWeb = config.isUserWeb;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();

            var webUrl = smeHelper.getNodeConfigValue(node, msg, node.urlType, node.url) || '';

            if (node.isUserWeb == '1' && webUrl.toLowerCase().startsWith('http://') == false && webUrl.toLowerCase().startsWith('https://') == false) {
                webUrl = 'semilimes://me@user-web/' + webUrl;
            }

            if (webUrl) {
                var smeMsg = {
                    Type: 'chat',
                    TypeID: 'D4FC2714-DE91-4067-8A33-2CE1FD42A71F',
                    Reference: node.reference,
                    Body: webUrl,
                    WebView: {
                        Url: webUrl,
                        ViewTypeID: '71de2cb1-d996-4497-807b-b389db5cf217',
                        IsFullScreen: node.enableFullScreen == '1',
                        LiveWebOption: node.viewSize,
                    }
                };

                var core = new Core();
                var smeHelper = new core.SmeHelper();
                smeHelper.addSendingMsg(msg, smeMsg);
            }

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-webviewmessage", SmeNode);
};