# Node-RED semilimes
[![Platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)   [![License](https://img.shields.io/badge/license-Apache--License-lightgrey)](http://www.apache.org/licenses/LICENSE-2.0) [![Downloads](https://img.shields.io/badge/download-github-purple)](https://github.com/semimob/node-red-connector) [![Install](https://img.shields.io/badge/Install-NPM-blue)](https://www.npmjs.com/package/node-red-contrib-semilimes)

This package of Node-RED nodes to extends your semilimes account with your programming ability, such as auto reply, booking flow or even message-base interface of your exsting system to expose to semilimes Messenger.

## Agenda
- Connect Node-RED to semlimes Messenger.
- Send and receive message with contacts in semlimes Messenger.
- Collect user input with semilimes Messenger's forms.
- Expose data to semilimes Messenger.

## Installation
[![NPM](https://nodei.co/npm/node-red-contrib-semilimes.png?downloads=true)](https://nodei.co/npm/node-red-contrib-semilimes/)

You can install the nodes using node-red's "Manage palette" in the side bar.

Or run the following command in the root directory of your Node-RED installation

    npm install node-red-contrib-semilimes --save

## Installation of the mobile apps
- IOS semilimes Messenger : [![Platform](https://img.shields.io/badge/Apple%20IOS-semilimes%20Messenger-blue.svg)](https://apps.apple.com/us/app/semilimes-mesh/id1536363738?l=en)  

- Android semilimes Messenger : [![Platform](https://img.shields.io/badge/Google--Play-semilimes%20Messenger-darkgreen.svg)](https://play.google.com/store/apps/details?id=net.semilimes.messenger&hl=en&gl=US)  

## Dependencies
The nodes are tested with `Node.js v12.0.0` and `Node-RED v1.3.7`.

## Connect to semilimes
Setup connection to semilimes server in Node-RED flow.
![Connect to semilimes flow](resources/images/connect_to_semilimes_flow.jpg)

1. Add a `listener` node then config its `Connector` property to create a `connector` configuration.
![Property editor of listener node](resources/images/add_listener_node.jpg)

2. Configure the `connector` node and connect it to semilimes.
![Config connector node](resources/images/connect_to_semilimes.jpg)

3. Add a `sender` node and configure its `Connector` property to the same `connector` configuration.
You now can both send and receive messages with semilimes using the `listener` and `sender` nodes.

Sample flow to connect to semilimes, send and receive messages.
[Connect to semilimes flow](examples/connect%20to%20semilimes%20flow.json)

# Examples
- [Sample flow](examples/send HTML message flow.json) to send [HTML Message](docs/HtmlMessage.md) to semilimes.

# License
Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/
