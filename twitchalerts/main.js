var request = require('request')
var SIOclient = require('socket.io-client')

// Get ID from command line
var token = process.argv[2]
if (!token) {
	console.error('Missing API token (node main.js <TA_API_TOKEN>)')
}

function getSocketToken(APItoken) {
	// Ask twitchalerts for socket token
	request({
		url: 'https://www.twitchalerts.com/service/get-socket-token',
		qs: {
			token: APItoken,
			ts: Date.now()
		}
	}, function (error, response, body) {
		if (error) {
			return console.error(error)
		}

		try {
			body = JSON.parse(body)
		} catch (e) {
			return console.error('Invalid token given')
		}

		var socketToken = body.token

		if (socketToken) {
			console.info('Got token')
			connectToSocket(socketToken)
		}
	})
}

function connectToSocket(socketToken) {
	var client = SIOclient('http://io.twitchalerts.com:4567', {
		query: {
			token: socketToken
		}
	})

	// General connection health info
	client.on('connect', function () {
		console.info('Connection made!')
	})

	client.on('connect_error', function (error) {
		console.error('Socket connection failed', error)
	})

	client.on('connect_timeout', function () {
		console.error('Connection timeout')
	})

	// Alerts
	client.on('follows', function (info) {
		console.log('Follow', info)
	})

	client.on('subscriptions', function (info) {
		console.log('Subscription', info)
	})

	client.on('donations', function (info) {
		console.log('Donation', info)
	})

	client.on('hosts', function (info) {
		console.log('Hosting', info)
	})
}

getSocketToken(token)