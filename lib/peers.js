'use strict'

const Hub = require('signalhub')
const Peer = require('simple-peer')

const randomId = () => {
	let n=6, s='';
	while (n--) { s += (Math.random() * 16 | 0).toString(16) }
	return s
}



const channel = location.hash.length === 7 ? location.hash.slice(1) : randomId()
const initiator = location.hash.length === 7



const peer = (channel) => {
	const hub = Hub('avion', 'https://signalhub.mafintosh.com')

	const p = new Peer({
		initiator,
		reconnectTimer: 500,
		channelName: channel,
		trickle: false
	})

	p.on('error', (e) => console.error(`${channel}:error`, e))
	p.on('connect', () => console.info(`${channel}:connect`))
	p.on('close', () => console.info(`${channel}:close`))

	p.on('signal', (s) => {
		// console.debug(`${channel}:signal-in`)
		s.fromInitiator = initiator
		hub.broadcast(channel, s)
	})
	const subscription = hub.subscribe(channel)
	subscription.on('data', (s) => {
		if (s.fromInitiator === initiator) return
		// console.debug(`${channel}:signal-out`)
		p.signal(s)
	})
	p.once('connect', () => hub.close())

	return p
}



module.exports = {channel, initiator, peer}
