"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
       
        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var typeID = msg.payload && msg.payload.TypeID;
            if (typeID && typeID.toUpperCase() == '25D777FD-9111-48B2-A8A5-2A3E4F1A3CA3') {
                var req = msg.payload.HttpRequest;
                if (req) {
                    msg.HttpRequest = req;
                    msg.method = req.Method;
                    msg.url = req.Path;
                    msg.headers = req.Headers && req.Headers.map(x => (x.Name && (x.Name + ':')) + (x.Value || ''));
                    msg.cookies = req.Cookies;
                    msg.payload = {};

                    if (req.Content) {
                        if (req.ContentType && req.ContentType.toUpperCase().startsWith('TEXT/')) {
                            msg.payload = req.Content;
                        }
                        else {
                            var buff = new Buffer(req.Content, 'base64');
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