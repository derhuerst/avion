'use strict'

const Emitter = require('component-emitter')

const channel = (network, name) => {
	const channel = new Emitter()
	network.on('data', (d) => {
		d = JSON.parse(d)
		if (d.channel !== name) return
		console.debug(name + ':in', d.payload)
		channel.emit('data', d.payload)
	})
	channel.send = (payload) => {
		console.debug(name + ':out', payload)
		network.send(JSON.stringify({channel: name, payload}))
	}
	return channel
}

module.exports = channel
