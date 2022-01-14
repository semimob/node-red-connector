"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
       
        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var requestID = msg.HttpRequest && msg.HttpRequest.RequestID;
            if (requestID) {

                var httpResponse = {
                    RequestID: requestID,
                    StatusCode: msg.statusCode,
                    StatusMessage: msg.statusMessage,
                    Headers: msg.headers
                };

                if (msg.headers) {
                    httpResponse.Headers = {};
                    for (var headerName in msg.headers) {
                        var headerValue = msg.headers[headerName];
                        httpResponse.Headers[headerName] = typeof (headerValue || '') == 'string' ? headerValue : JSON.stringify(headerValue);
                    }
                }

                if (msg.responseCookies) {
                    httpResponse.SetCookies = [];
                    for (var cookieName in msg.responseCookies) {
                        var cookie = msg.responseCookies[cookieName];
                        httpResponse.SetCookies.push({
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
                        httpResponse.Content = msg.payload.toString('base64');
                    }
                    else if (typeof (msg.payload) == 'string') {
                        httpResponse.Content = msg.payload;
                    }
                    else {
                        httpResponse.Content = JSON.stringify(msg.payload);
                    }
                }
                
                var payload = {};
                payload.Type = 'client';
                payload.TypeID = '80348B9C-8FB4-4071-BF4A-E07852543D06';
                payload.HttpResponse = httpResponse;

                send({ payload: payload }, false);
            }

            done && done();
        });
    };

    RED.nodes.registerType("sme-httpresponse", SmeNode);
};