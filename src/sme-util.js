const https = require('https');

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