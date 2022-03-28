# node-RED semilimes
[![Platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)   [![License](https://img.shields.io/badge/license-Apache--License-lightgrey)](http://www.apache.org/licenses/LICENSE-2.0) [![Downloads](https://img.shields.io/badge/download-github-purple)](https://github.com/pernicious-flier/Node-Red-semilimes-Connector) [![Install](https://img.shields.io/badge/Install-NPM-blue)](https://www.npmjs.com/package/node-red-semilimes-connector)

This package contains nodes to extends your semilimes account with your programming ability. Such as auto anwser, booking flow or even use semilimes Messenger as message-base interface to your exsting system.

# Installation
[![NPM](https://nodei.co/npm/node-red-contrib-semilimes.png?downloads=true)](https://nodei.co/npm/node-red-contrib-semilimes/)

You can install the nodes using node-red's "Manage palette" in the side bar.

Or run the following command in the root directory of your Node-RED installation

    npm install node-red-contrib-semilimes --save

# Installation of the mobile apps
- IOS semilimes Messenger : [![Platform](https://img.shields.io/badge/Apple%20IOS-semilimes%20Messenger-blue.svg)](https://apps.apple.com/us/app/semilimes-mesh/id1536363738?l=en)  

- Google Play semilimes Messenger : [![Platform](https://img.shields.io/badge/Google--Play-semilimes%20Messenger-darkgreen.svg)](https://play.google.com/store/apps/details?id=net.semilimes.messenger&hl=en&gl=US)  

# Dependencies
The nodes are tested with `Node.js v16.13.1` and `Node-RED v2.1.4`. However, it would work with earlier versions of both Node.js & Node-RED.

# Usage
- Use `post` and `send` nodes to send messages to semilimes.
- Use `receive` node to listener for messages from semilimes.
- Register your Node-RED flow to semilimes as an application via `connector` properties of the nodes. Then you can add your flow to your semilimes account to interact with it.
[How to connect to semilimes](docs/ConnectToSemilimes.md)

# License
Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/
