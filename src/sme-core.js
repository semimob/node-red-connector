const https = require('https');
// const ws = require('ws');

// //--------------------SmeWebSocket-----------------------------------
// function SmeWebSocket(path, notifier){
	// var webSocket = null;
	// var requestedToClose = false;
	// var reconnectTimer = null;
	
	// function connect(){
		// disconnect();
		// requestedToClose = false;
		
		// var isNoProxyPath = false;
		// var envProxy = process.env.HTTP_PROXY || process.env.http_proxy;
		// var envNoproxies = (process.env.NO_PROXY || process.env.no_proxy || "").split(",");
		// if (envNoproxies){
			// for (var i in envNoproxies){
				// if (path.indexOf(envNoproxies[i].trim()) !== -1){
					// isNoProxyPath = true;
					// break;
				// }
			// }
		// }
		
		// var proxyAgent = null;
		// if (envProxy && isNoProxyPath == false) {
			// proxyAgent = new HttpsProxyAgent(prox);
		// }

		// var options = {};
		// if (proxyAgent) {
			// options.agent = proxyAgent;
		// }
		
		// webSocket = new ws.WebSocket(path,options);
		// webSocket.setMaxListeners(0);
		// handleConnection(webSocket);
	// }
	
	// function disconnect(){
		// requestedToClose = true;
		// if (webSocket){
			// webSocket.close();
			// webSocket = null;
		// }
	// }
	
	// function reconnect(){
		// if (requestedToClose != true) {
			// clearTimeout(reconnectTimer);
			// reconnectTimer = setTimeout(function() { connect(); }, 5000); // try to reconnect every 5 secs... bit fast ?
		// }
	// }
	
	// function handleConnection(socket) {
		// socket.on('open',function() {
			// if (notifier) {
				// notifier.emit('opened',{count:'',id:id});
			// }
		// });
		
		// socket.on('close',function() {
			// if(notifier) {
				// notifier.emit('closed',{count:'',id:id});
			// }
			
			// reconnect();
		// });
		
		// socket.on('message',function(msg, flags) {
			// if(notifier){
				// notifier.emit('message', msg);
			// }
		// });
		
		// socket.on('error', function(err) {
			// if(notifier){
				// notifier.emit('error', err);
			// }
			
			// reconnect();
		// });
	// }
	
	// function send(msg){
		// if (webSocket){
			// webSocket.send(msg);
		// }
	// }
	
	// this.send = send;
	// connect();
// };

function SmeClient(host, port){
	if (typeof host === 'object'){
		this.host = host.host || 'cloud.semilimes.net';
		this.port = host.port;
	}
	else {
		this.host = host || 'cloud.semilimes.net';
		this.port = port;
	}
	
	function callApi(methodID, data){
		return new Promise((resolve, reject) => {
			var postData = data && JSON.stringify(data);

			var options = {
				hostname: 'localhost',
				port: 443,
				path: `https://${this.host}:${this.port || 443}/CloudServer/api/${methodID}?format=json`,
				method: 'POST',
				rejectUnauthorized: false,
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': (postData && postData.length) || 0,
				}
			};
		
			var req = https.request(options, (res) => {
				res.on('data', (d) => {
					resolve(d && JSON.parse(d));
				});
			});

			req.on('error', (e) => {
			  console.error(e);
			  reject(e);
			});

			if (postData)
				req.write(postData);
			
			req.end();
		});
	};
	
	return {
		callApi: callApi
	};
};

module.exports = {
	createClient: SmeClient
};