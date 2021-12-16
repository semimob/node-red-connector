"use strict";

module.exports = function (RED) {
    const https = require('https');
    const EventEmitter = require('events');
    const ws = require('ws');

    //--------------------SmeWebSocket-----------------------------------
    function SmeWebSocket(serverWsURL) {
        EventEmitter.call(this);

        var webSocket = null;
        var requestedToClose = false;
        var reconnectTimer = null;
        var thisSmeWebSocket = this;

        function connect() {
            disconnect();
            requestedToClose = false;

            var isNoProxyPath = false;
            var envProxy = process.env.HTTP_PROXY || process.env.http_proxy;
            var envNoproxies = (process.env.NO_PROXY || process.env.no_proxy || "").split(",");
            if (envNoproxies) {
                for (var i in envNoproxies) {
                    if (serverWsURL.indexOf(envNoproxies[i].trim()) !== -1) {
                        isNoProxyPath = true;
                        break;
                    }
                }
            }

            var proxyAgent = null;
            if (envProxy && isNoProxyPath == false) {
                proxyAgent = new HttpsProxyAgent(prox);
            }

            var options = {
                perMessageDeflate: false,
                rejectUnauthorized: false
            };

            if (proxyAgent) {
                options.agent = proxyAgent;
            }

            console.log(`Connect to "${serverWsURL}"... `);
            webSocket = new ws.WebSocket(serverWsURL, options);
            webSocket.setMaxListeners(0);
            handleConnection(webSocket);
        }

        function disconnect() {
            requestedToClose = true;
            if (webSocket) {
                webSocket.close();
                webSocket = null;
            }
        }

        function reconnect() {
            if (requestedToClose != true) {
                clearTimeout(reconnectTimer);
                reconnectTimer = setTimeout(function () { connect(); }, 5000); // try to reconnect every 5 secs... bit fast ?
            }
        }

        function handleConnection(socket) {
            socket.on('open', function () {
                console.log('ws opened!');
            });

            socket.on('close', function () {
                console.log('ws closed!');
                reconnect();
            });

            socket.on('message', function (msg, flags) {
                console.log('ws message!');
                thisSmeWebSocket.emit('message', msg);
            });

            socket.on('error', function (err) {
                console.log('ws error!' + err);
                reconnect();
            });
        }

        function send(msg) {
            if (webSocket && msg) {
                if (typeof (msg) === 'object')
                    msg = JSON.stringify(msg);
                webSocket.send(msg);
            }
        }

        //  Export
        this.send = send;
        this.close = disconnect;

        if (serverWsURL)
            connect();
    };

    function SmeApiClient(serverApiURL) {

        function callApi(methodID, data) {
            return new Promise((resolve, reject) => {
                var postData = data && JSON.stringify(data);

                var options = {
                    hostname: 'localhost',
                    port: 443,
                    path: `${serverApiURL}${methodID}?format=json`,
                    method: 'POST',
                    rejectUnauthorized: false,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': (postData && postData.length) || 0,
                    }
                };

                var req = https.request(options, (res) => {
                    res.on('data', (d) => {
                        resolve(d && JSON.parse(d));
                    });
                });

                req.on('error', (e) => {
                    console.error(e);
                    reject(e);
                });

                if (postData)
                    req.write(postData);

                req.end();
            });
        };

        //  Export.
        this.callApi = callApi;
    };

    return {
        SmeApiClient: SmeApiClient,
        SmeWebSocket: SmeWebSocket
    };
}