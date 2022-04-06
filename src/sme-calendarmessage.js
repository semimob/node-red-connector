"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.reference = config.reference;
        this.items = config.items;
        this.itemsType = config.itemsType;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var itemsArray = null;
            if (node.items) {
                switch (node.itemsType) {
                    case 'json':
                        itemsArray = JSON.parse(node.items);
                        break;
                    case 'msg':
                        itemsArray = msg[node.items];
                        break;
                    case 'flow':
                        itemsArray = node.context().flow.get(node.items);
                        break;
                    case 'global':
                        itemsArray = node.context().global.get(node.items);
                        break;
                }
            }

            var selectedItems = [];
            if (Array.isArray(itemsArray)) {
                selectedItems = itemsArray.filter(x => { return typeof (x.Start) == 'number' && typeof (x.End) == 'number' }).map(x => {
                    return {
                        Start: x.Start,
                        End: x.End,
                        Title: x.Title || x.Name
                    }
                });
            }

            var firstDate = selectedItems.length <= 0 ? Date.now() : selectedItems[0].Start;
            var smeCalendarMsg = {
                Type: "chat",
                TypeID: '2DD36694-2455-4023-8FBC-C293F2BBA86C', //   predefined ID of semilimes's calendar message.
                Date: firstDate,
                Items: selectedItems
            };

            var core = new Core();
            var smeHelper = new core.SmeHelper();
            smeHelper.addSendingMsg(msg, smeCalendarMsg);

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-calendarmessage", SmeNode);
};