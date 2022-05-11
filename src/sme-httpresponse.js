"use strict";

const { CONNECTING } = require('ws');
const Core = require('./sme-core.js');

module.exports = function (RED) {

    function isTextContentType(contentType) {
        if (!contentType)
            return false;

        var c = contentType.toLowerCase();
        return c.startsWith("text/") || c.startsWith("multipart/") || contentType.indexOf("script") >= 0;
    }

    function SmeNode(config) {
        RED.nodes.createNode(this, config);
       
        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            var smeReceivedMsg = smeHelper.getReceivedMsg(msg);

            var requestID = smeReceivedMsg && smeReceivedMsg.HttpRequest && smeReceivedMsg.HttpRequest.RequestID;
            if (requestID) {
                var smeHttpResponse = {
                    RequestID: requestID,
                    StatusCode: msg.statusCode,
                    StatusMessage: msg.statusMessage,
                    Headers: msg.headers
                };

                if (msg.headers) {
                    smeHttpResponse.Headers = {};
                    for (var headerName in msg.headers) {
                        var headerValue = msg.headers[headerName];
                        smeHttpResponse.Headers[headerName] = typeof (headerValue || '') == 'string' ? headerValue : JSON.stringify(headerValue);
                    }
                }

                if (msg.responseCookies) {
                    smeHttpResponse.SetCookies = [];
                    for (var cookieName in msg.responseCookies) {
                        var cookie = msg.responseCookies[cookieName];
                        smeHttpResponse.SetCookies.push({
                            Name: cookieName,
                            Path: cookie.path || cookie.Path,
                            Domain: cookie.domain || cookie.Domain,
                            SameSite: cookie.samesite || cookie.SameSite,
                            Value: cookie.value || cookie.Value,
                            Values: cookie.values || cookie.Values,
                            Expires: cookie.expires || cookie.Expires,
                            Secure: cookie.secure || cookie.Secure,
                            Sharable: cookie.sharable || cookie.Sharable,
                            HttpOnly: cookie.httponly || cookie.HttpOnly
                        });
                    }
                }

                if (msg.payload) {
                    if (Buffer.isBuffer(msg.payload)) {
                        var contentType = msg.headers && msg.headers["content-type"];
                        smeHttpResponse.Content = isTextContentType(contentType) ? msg.payload.toString() : msg.payload.toString('base64');
                    }
                    else if (typeof (msg.payload) == 'string') {
                        var contentType = msg.headers && msg.headers["content-type"];
                        var isTextContent = isTextContentType(contentType);

                        smeHttpResponse.Content = isTextContent ? msg.payload : Buffer.from(msg.payload).toString('base64');

                        if (isTextContent == false)
                            node.status({ fill: "red", shape: "ring", text: "Connected HTTP Request node should return binary!" });
                    }
                    else {
                        smeHttpResponse.Content = JSON.stringify(msg.payload);
                    }
                }

                var smeSendingMsg = {};
                smeSendingMsg.Type = 'client';
                smeSendingMsg.TypeID = '80348B9C-8FB4-4071-BF4A-E07852543D06';
                smeSendingMsg.HttpResponse = smeHttpResponse;

                var smeReceivedMsg = smeHelper.addSendingMsg(msg, smeSendingMsg);
            }
            else {
                node.status({ fill: "red", shape: "ring", text: "Was not connected from an User Web Request node!" });
            }

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-httpresponse", SmeNode);
};