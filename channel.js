'use strict'

const Emitter = require('component-emitter')

const Id = () => {
	let s = '', n = 4
	while (n--) s += (Math.random() * 36 | 0).toString(36)
	return s
}

const channel = (network, name) => {
	const channel = new Emitter()

	network.on('data', (d) => {
		d = JSON.parse(d)
		if (d.channel !== name) return

		if ('ack' in d) {
			console.debug(name + ':ack', d.ack)
			return channel.emit('ack:' + d.ack)
		}
		network.send(JSON.stringify({channel: name, ack: d.id}))

		console.debug(name + ':in', d.payload, `(${d.id})`)
		channel.emit('data', d.payload)
	})

	channel.send = (payload, cb) => {
		const id = Id()
		if ('function' === typeof cb) channel.once('ack:' + id, cb)

		console.debug(name + ':out', payload, `(${id})`)
		network.send(JSON.stringify({channel: name, id, payload}))
	}

	return channel
}

module.exports = channel
