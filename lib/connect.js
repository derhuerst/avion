'use strict'

const Hub = require('signalhub')
const Peer = require('simple-peer')

const connect = (id, channel, isInitiator = false) => {
	const hub = Hub('avion', 'https://signalhub.mafintosh.com')

	const p = new Peer({
		initiator: isInitiator,
		reconnectTimer: 500,
		channelName: channel,
		trickle: false
	})

	p.on('error', (e) => console.error(`${channel}:error`, e))
	p.on('connect', () => console.info(`${channel}:connect`))
	p.on('close', () => console.info(`${channel}:close`))

	p.on('signal', (s) => {
		s.fromInitiator = isInitiator
		hub.broadcast(channel, s)
	})
	const subscription = hub.subscribe(channel)
	subscription.on('data', (s) => {
		if (s.fromInitiator === isInitiator) return
		p.signal(s)
	})
	p.once('connect', () => hub.close())

	return p
}

module.exports = connect
