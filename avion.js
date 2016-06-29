'use strict'

const peers = require('./peers')
const ui = require('./ui')



peers.meta.on('error', (e) => ui.emit('error', e.message))
peers.meta.on('connect', () => {
	if (peers.initiator) peers.meta.send('hi')
	// todo
})
peers.meta.on('data', (d) => {
	// todo
})
