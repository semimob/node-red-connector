"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.objectType = config.objectType;
        this.objectName = config.objectName;
        this.objectDesc = config.objectDesc;
        this.objectParent = config.objectParent;
        this.objectVisible = config.objectVisible;
        this.objectLocked = config.objectLocked;
        this.objectReaction = config.objectReaction;

        if (!this.objectName)
            return;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var objectTypeID = null;
            if (!node.objectParent) {
                objectTypeID = {
                    'Moment': '',
                }[node.objectType || 'Moment'];
            }

            var smeMsg = {
                Type: 'client',
                TypeID: '5E78B750-1F60-40EB-9BAC-FA7B39E11767',
                ObjectInfo: {
                    ObjectTypeID: objectTypeID,
                    Name: node.objectName,
                    Description: node.objectDesc,
                    ParentName: node.objectParent,
                    Visisble: node.objectVisible,
                    LockContent: node.objectLocked,
                    EnableReaction: node.objectReation,
                }
            };

            send({ payload: setFormMsg }, false);
            
            done && done();
        });
    };

    RED.nodes.registerType("sme-createobject", SmeNode);
};