"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.objectType = config.objectType;
        this.objectTypeCustom = config.objectTypeCustom;
        this.objectTypeCustomType = config.objectTypeCustomType;

        this.objectName = config.objectName;
        this.objectNameType = config.objectNameType;

        this.objectDesc = config.objectDesc;
        this.objectDescType = config.objectDescType;

        this.objectVisible = config.objectVisible;
        this.objectVisibleType = config.objectVisibleType;

        this.objectLocked = config.objectLocked;
        this.objectLockedType = config.objectLockedType;

        this.objectReaction = config.objectReaction;
        this.objectReactionType = config.objectReactionType;

        this.objectTagType = config.objectTagType;
        this.objectCustomTag = config.objectCustomTag;
        this.objectCustomTagType = config.objectCustomTagType;
        this.objectStandardTag = config.objectStandardTag;

        if (!this.objectName)
            return;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();

            var objectType = node.objectType;
            if (objectType == 'Custom')
                objectType = smeHelper.getNodeConfigValue(node, msg, node.objectTypeCustomType, node.objectTypeCustom);

            var objectName = smeHelper.getNodeConfigValue(node, msg, node.objectNameType, node.objectName);
            var objectDesc = smeHelper.getNodeConfigValue(node, msg, node.objectDescType, node.objectDesc);
            var objectVisible = smeHelper.getNodeConfigValue(node, msg, node.objectVisibleType, node.objectVisible);
            var objectLocked = smeHelper.getNodeConfigValue(node, msg, node.objectLockedType, node.objectLocked);
            var objectReaction = smeHelper.getNodeConfigValue(node, msg, node.objectReactionType, node.objectReaction);

            var objectTag = null;
            switch (node.objectTagType) {
                case 'Standard': {
                    objectTag = node.objectStandardTag;
                    break;
                }
                case 'Custom': {
                    console.log('Custom: ', node);
                    objectTag = smeHelper.getNodeConfigValue(node, msg, node.objectCustomTagType, node.objectCustomTag);
                    break;
                }
            }

            objectVisible = smeHelper.isTrue(objectVisible);
            objectLocked = smeHelper.isTrue(objectLocked);
            objectReaction = smeHelper.isTrue(objectReaction);

            if (objectType && objectName) {
                var smeMsg = {
                    Type: 'client',
                    TypeID: '5E78B750-1F60-40EB-9BAC-FA7B39E11767',
                    ObjectInfo: {
                        ObjectType: objectType,
                        Name: objectName,
                        Description: objectDesc,
                        Visisble: objectVisible,
                        LockContent: objectLocked,
                        EnableReaction: objectReaction,
                        Tag: objectTag,
                    }
                };

                smeHelper.addSendingMsg(msg, smeMsg);
            }

            send(msg, false);
            
            done && done();
        });
    };

    RED.nodes.registerType("sme-bucketcreator", SmeNode);
};