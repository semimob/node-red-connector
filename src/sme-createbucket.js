"use strict";

module.exports = function (RED) {

    function SmeNode(config) {
        RED.nodes.createNode(this, config);

        this.objectType = config.objectType;
        this.objectName = config.objectName;
        this.objectDesc = config.objectDesc;
        this.objectParent = config.objectParent;
        this.objectVisible = config.objectVisible;
        this.objectLocked = config.objectLocked;
        this.objectReaction = config.objectReaction;
        this.objectTag = config.objectTag;

        if (!this.objectName)
            return;

        var node = this;

        node.on('input', function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };

            var objectTypeID = null;

            if (!node.objectParent) {
                objectTypeID = {
                    'Moment': '7D4D8B5D-27ED-4E69-A31A-803111C2DFC2',
                    'Profile': 'D6AA23A5-37D4-4035-8900-AEABF75EEBD9',
                    'Group': '24C0C6AC-101B-460C-B34D-3DE1163F2058',
                    'Channel': '6F016F95-2BD1-4311-BFC4-C09B7EF61F7E'
                }[node.objectType || 'Moment'];
            }

            if (objectTypeID || node.objectParent) {
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
                        Tag: node.objectTag,
                    }
                };

                send({ payload: smeMsg }, false);
            }
            
            done && done();
        });
    };

    RED.nodes.registerType("sme-createbucket", SmeNode);
};