"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.baseUrl = config.baseUrl;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            var smeReceivedMsg = smeHelper.getReceivedMsg(msg);
            
            var typeID = smeReceivedMsg.TypeID;
            if (typeID && typeID.toUpperCase() == '25D777FD-9111-48B2-A8A5-2A3E4F1A3CA3') {
                var smeHttpRequest = smeReceivedMsg.HttpRequest;
                if (smeHttpRequest) {
                    msg.method = smeHttpRequest.Method;
                    msg.url = (node.baseUrl || '') + smeHttpRequest.Path;
                    msg.headers = smeHttpRequest.Headers && smeHttpRequest.Headers.map(x => (x.Name && (x.Name + ':')) + (x.Value || ''));
                    msg.cookies = smeHttpRequest.Cookies;
                    msg.payload = {};

                    if (smeHttpRequest.Content) {
                        if (smeHttpRequest.ContentType && smeHttpRequest.ContentType.toUpperCase().startsWith('TEXT/')) {
                            msg.payload = smeHttpRequest.Content;
                        }
                        else {
                            var buff = new Buffer(smeHttpRequest.Content, 'base64');
                            msg.payload = buff.toString();
                        }
                    }
                    
                    send(msg);
                }
            }

            done && done();
        });
    };

    RED.nodes.registerType("sme-httprequest", SmeNode);
};