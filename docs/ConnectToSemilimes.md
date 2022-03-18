# Connect to semilimes
Setup connection to semilimes server in Node-RED flow.

1. Add a `listener` node then config its `Connector` property to create a `sme-connector` configuration.
![Property editor of listener node](images/add_listener_node.jpg)

2. Configure the `sme-connector` node and connect it to semilimes.
![Config connector node](images/connect_to_semilimes.jpg)
*Optionally use 'uat.semilimes.net' for development.*

3. Add a `post` node and configure its `Connector` property to the same `sme-connector` configuration.
You now can both send and receive messages with semilimes using the `listener` and `post` nodes.

Try this flow to connect to semilimes, send and receive messages.
![connect to semilimes](../examples/connect to semilimes flow.json)

# References
Sample ![flow](../examples/send%20HTML%20message%20flow.json) to send ![HTML Message](HtmlMessage.md) to semilimes.