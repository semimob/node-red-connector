"use strict";

const Core = require('./sme-core.js');

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);
        
        this.objectAvatar = config.objectReference;
        this.objectAvatarType = config.objectReferenceType;

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

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var core = new Core();
            var smeHelper = new core.SmeHelper();

            var objectAvatar = smeHelper.getNodeConfigValue(node, msg, node.objectAvatarType, node.objectAvatar);
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

            var objectInfo = {};

            if (objectAvatar)
                objectInfo.AvatarID = objectAvatar;

            if (objectName)
                objectInfo.Name = objectName;

            if (objectDesc)
                objectInfo.Description = objectDesc;

            if (objectVisible)
                objectInfo.Visisble = smeHelper.isTrue(objectVisible);

            if (objectLocked)
                objectInfo.LockContent = smeHelper.isTrue(objectLocked);

            if (objectReaction)
                objectInfo.EnableReaction = smeHelper.isTrue(objectReaction);

            if (objectTag)
                objectInfo.Tag = objectTag;

            var smeMsg = {
                Type: 'client',
                TypeID: '21DDF902-FA62-494F-9294-A55100F6D7B0',
                ObjectInfo: objectInfo,
            };

            smeHelper.addSendingMsg(msg, smeMsg);

            send(msg, false);

            done && done();
        });
    };

    RED.nodes.registerType("sme-bucketupdater", SmeNode);
};