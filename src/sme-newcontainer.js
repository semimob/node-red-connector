"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.containerType = config.containerType;
        this.containerName = config.containerName;
        this.containerDesc = config.containerDesc;
        this.containerParent = config.containerParent;

        if (!this.containerName)
            return;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var objectTypeID = null;
            if (!node.containerParent) {
                objectTypeID = {
                    'Moment': '',
                }[node.containerType || 'Moment'];
            }

            var smeMsg = {
                Type: 'client',
                TypeID: '5E78B750-1F60-40EB-9BAC-FA7B39E11767',
                ObjectInfo: {
                    ObjectTypeID: objectTypeID,
                    Name: node.containerName,
                    Description: node.containerDesc
                }
            };

            send({ payload: setFormMsg }, false);
            
            done && done();
        });
    };

    RED.nodes.registerType("sme-newcontainer", SmeNode);
};