'use strict'

const Hub = require('signalhub')
const Peer = require('simple-peer')
const requestUserMediaPermission = require('./request-user-media-permission')

const SINGALHUBS = [
	'https://signalhub.jannisr.de',
	// https://github.com/mafintosh/signalhub/tree/dc1ddeb28b3e8b6d13b47b98e14b269486c91ef4#publicly-available-signalhubs
	// 'https://signalhub-jccqtwhdwc.now.sh'
]

const connect = (id, channel, isInitiator = false) => {
	return requestUserMediaPermission()
	.then(() => {
		console.info(channel, 'user media permission granted')
	}, (err) => {
		console.error(`${channel}:error`, 'user media permission not granted', err)
	})
	.then(() => {
		const hub = Hub('avion', SINGALHUBS)

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
	})
}

module.exports = connect
