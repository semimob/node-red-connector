"use strict";

const { publicDecrypt } = require('crypto');
const { send } = require('process');
const { debug } = require('util');

module.exports = function (RED) {
    const https = require('https');
    const EventEmitter = require('events');
    const ws = require('ws');

    //--------------------SmeHelper-----------------------------------
    function SmeHelper() {
        const SME_BAG_NAME = '_sme';
        const SME_SENDING_BOX_NAME = 'sendingMsgs';
        const SME_RECEIVED_MSG_NAME = 'receivedMsg';
        const SME_DELIVERY_OPTION_NAME = 'DeliveryOption';
        const SME_DELIVERY_OPTION_TO_OBJECT_NAME = 'ToObject';

        function getSmeBag(nodeRedMsg) {
            if (!nodeRedMsg)
                return null;

            var smeBag = nodeRedMsg[SME_BAG_NAME];
            if (smeBag == null)
                smeBag = nodeRedMsg[SME_BAG_NAME] = {};
            return smeBag;
        }

        function setReceivedMsg(nodeRedMsg, smeMsg) {
            if (nodeRedMsg && smeMsg) {
                var smeBag = getSmeBag(nodeRedMsg);
                if (smeBag) {
                    smeBag[SME_RECEIVED_MSG_NAME] = smeMsg;
                    return smeMsg;
                }
            }

            return null;
        }

        function getReceivedMsg(nodeRedMsg) {
            if (!nodeRedMsg)
                return null;

            var smeBag = getSmeBag(nodeRedMsg);
            return smeBag[SME_RECEIVED_MSG_NAME];
        }

        function getSendingBox(nodeRedMsg) {
            if (!nodeRedMsg)
                return null;

            var smeBag = getSmeBag(nodeRedMsg);
            var smeSendingMsgs = smeBag[SME_SENDING_BOX_NAME];
            if (smeSendingMsgs == null)
                smeSendingMsgs = smeBag[SME_SENDING_BOX_NAME] = [];
            return smeSendingMsgs;
        }

        function addSendingMsg(nodeRedMsg, smeMsg) {
            if (nodeRedMsg && smeMsg) {
                var smeSendingMsgs = getSendingBox(nodeRedMsg);
                if (smeSendingMsgs)
                    smeSendingMsgs.push(smeMsg);

                return smeMsg;
            }

            return null;
        }

        function clearSendingBox(nodeRedMsg) {
            if (nodeRedMsg) {
                var smeBag = getSmeBag(nodeRedMsg);
                delete smeBag[SME_SENDING_BOX_NAME];
            }
        }

        function getOrCreateNewSendingFormMessage(nodeRedMsg) {
            if (nodeRedMsg == null)
                return null;

            var smeSendingMsgs = getSendingBox(nodeRedMsg);

            var lastMsg = smeSendingMsgs.length == 0 ? null : smeSendingMsgs[smeSendingMsgs.length - 1];
            var isLastMsgForm = lastMsg && lastMsg.TypeID && lastMsg.TypeID.toUpperCase() == '457D1D4F-C982-4CAF-BCC4-4B435860EFA3';

            var smeFormMsg = null;
            if (isLastMsgForm)
                smeFormMsg = lastMsg;
            else {
                smeFormMsg = {};
                smeSendingMsgs.push(smeFormMsg);
            }

            smeFormMsg.Type = smeFormMsg.Type || 'chat';
            smeFormMsg.TypeID = smeFormMsg.TypeID || '457d1d4f-c982-4caf-bcc4-4b435860efa3';    //  Use lower TypeID as the sign of this creation.
            smeFormMsg.FormItems = smeFormMsg.FormItems || [];

            return smeFormMsg;
        }

        function getNodeConfigValue(node, msg, selectionType, selectionValue) {
            if (selectionType && selectionValue) {
                switch (selectionType) {
                    case 'str': return selectionValue;
                    case 'num': return parseInt(selectionValue);
                    case 'bool': return isTrue(selectionValue);
                    case 'json': return JSON.parse(selectionValue);
                    case 'msg': return msg[selectionValue];
                    case 'flow': return node && node.context().flow.get(selectionValue);
                    case 'global': return node && node.context().global.get(selectionValue);
                }
            }

            return null;
        }

        function getMsgDeliveryOption(smeMsg) {
            if (!smeMsg)
                return null;

            var deliveryOption = smeMsg[SME_DELIVERY_OPTION_NAME];
            if (deliveryOption == null)
                deliveryOption = smeMsg[SME_DELIVERY_OPTION_NAME] = {};
            return deliveryOption;
        }

        function getMsgDeliveryOptionToObject(smeMsg) {
            var deliveryOption = getMsgDeliveryOption(smeMsg);
            if (!deliveryOption)
                return null;

            var toObject = deliveryOption[SME_DELIVERY_OPTION_TO_OBJECT_NAME];
            if (toObject == null)
                toObject = deliveryOption[SME_DELIVERY_OPTION_TO_OBJECT_NAME] = {};
            return toObject;
        }

        function isTrue(obj) {
            if (obj == null)
                return false;
            if (isNaN(obj))
                return ['TRUE', 'YES'].indexOf(('' + obj).toUpperCase()) >= 0;
            return obj > 0;
        }

        function isFalse(obj) {
            return !isTrue(obj);
        }

        //  Export
        this.getSmeBag = getSmeBag;
        this.setReceivedMsg = setReceivedMsg;
        this.getReceivedMsg = getReceivedMsg;
        this.addSendingMsg = addSendingMsg;
        this.getSendingBox = getSendingBox;
        this.clearSendingBox = clearSendingBox;
        this.getOrAddSendingFormMsg = getOrCreateNewSendingFormMessage;
        this.getNodeConfigValue = getNodeConfigValue;
        this.getMsgDeliveryOption = getMsgDeliveryOption;
        this.getMsgDeliveryOptionToObject = getMsgDeliveryOptionToObject;
        this.isTrue = isTrue;
        this.isFalse = isFalse;
    }

    //--------------------SmeWebSocket-----------------------------------
    function SmeWebSocket(serverWsURL) {

        var buffer = [];
        var webSocket = null;
        var requestedToClose = false;
        var reconnectTimer = null;
        var messageDeliver = new EventEmitter();

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

            console.log(`Connecting to "${serverWsURL}"... `);
            webSocket = new ws.WebSocket(serverWsURL, options);
            webSocket.setMaxListeners(0);
            messageDeliver.emit('status', 'connecting...');
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
                messageDeliver.emit('status', 'connected');

                if (buffer.length > 0) {
                    for (var i = 0; i < buffer.length; i++)
                        socket.send(buffer[i]);
                    console.log('ws sent ', buffer.length, ' buffered messages.');
                    buffer.length = 0;
                }
            });

            socket.on('close', function () {
                console.log('ws closed!');
                messageDeliver.emit('status', 'disconnected');
                reconnect();
            });

            socket.on('message', function (msg, flags) {
                msg = msg.toString();
                if (msg.startsWith('{')) {
                    try {
                        msg = JSON.parse(msg);
                    }
                    catch { }
                }
                messageDeliver.emit('message', msg);
            });

            socket.on('error', function (err) {
                console.log('ws error!' + err);
                reconnect();
            });
        }

        function send(msg) {
            if (msg) {
                if (typeof (msg) === 'object')
                    msg = JSON.stringify(msg);

                if (webSocket && webSocket.readyState == 1)
                    webSocket.send(msg);
                else {
                    buffer.push(msg);
                    console.log('buffered: ', msg);
                }
            }
        }

        function addMessageListener(listener) {
            messageDeliver.addListener('message', listener);
        }

        function addStatusListener(listener) {
            messageDeliver.addListener('status', listener);
        }

        //  Export
        this.send = send;
        this.close = disconnect;
        this.addMessageListener = addMessageListener;
        this.addStatusListener = addStatusListener;

        if (serverWsURL)
            connect();
    };

    function SmeApiClient(serverApiURL) {

        function callApi(methodID, data) {
            return new Promise((resolve, reject) => {
                var postData = data && JSON.stringify(data);

                var baseUrl = new URL(serverApiURL);

                var options = {
                    hostname: baseUrl.hostname,
                    port: 443,
                    path: `${baseUrl.pathname}${methodID}?format=json`,
                    method: 'POST',
                    rejectUnauthorized: false,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': (postData && postData.length) || 0,
                    }
                };

                var req = https.request(options, (res) => {
                    res.on('data', (d) => {
                        if (Buffer.isBuffer(d)) {
                            d = d.toString();
                        }

                        if (typeof (d) == 'string' && d.startsWith('{')) {
                            try {
                                var jsonData = JSON.parse(d);
                                if (jsonData) {
                                    console.log('Call API resolved a JSON: ', jsonData);
                                    resolve(jsonData);
                                    return;
                                }
                            }
                            catch (ex) {
                                console.debug('Error parasing API JSON result: ', ex);
                            }
                        }

                        console.log('Call API resolved: ', d);
                        resolve(d);
                    });
                });

                req.on('error', (e) => {
                    console.debug('Call API rejected: ', e);
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
        SmeHelper: SmeHelper,
        SmeApiClient: SmeApiClient,
        SmeWebSocket: SmeWebSocket
    };
}