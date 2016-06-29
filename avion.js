'use strict'

const peer = require('./peer')
const ui = require('./ui')



peer.on('error', (e) => {
	// todo
})
peer.on('connect', () => {
	if (peer.initiator) peer.send('hi')
	// todo
})
peer.on('data', (d) => {
	// todo
})
