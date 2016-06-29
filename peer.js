'use strict'

const Hub = require('signalhub')
const Peer = require('simple-peer')

const randomId = () => {
	let n=6, s='';
	while (n--) { s += (Math.random() * 16 | 0).toString(16) }
	return s
}



// const channel = location.hash.length === 7 ? location.hash.slice(1) : randomId()
const channel = location.hash.length === 7 ? location.hash.slice(1) : 'foo123'
const id = randomId() // used to distinguish foreign and own signals
const initiator = location.hash.length === 7



const peer = new Peer({initiator, channelName: channel})
peer.on('error', (e) => console.error(e))
peer.on('connect', () => console.info('connected'))
peer.on('data', (d) => console.debug('data', d.toString()))



const hub = Hub('avion', 'https://signalhub.mafintosh.com')
peer.on('signal', (s) => {
	console.debug('signal out', s)
	s.__from = id
	hub.broadcast(channel, s)
})
peer.on('connect', () => hub.close())
hub.subscribe(channel).on('data', (s) => {
	console.debug('signal in', s)
	if (s.__from !== id) peer.signal(s)
})



peer._ = {channel, id, initiator}
module.exports = peer
