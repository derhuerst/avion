'use strict'

const find = require('lodash.find')
const channel = require('./channel')
const incomingFile = require('./file').received
const outgoingFile = require('./file').sent
const ui = require('./ui')

const metaPeer = require('./peers').meta
const dataPeer = require('./peers').data



const list = channel(metaPeer, 'list')
const files = {} // by id



// metaPeer <-> ui brige

list.on('data', (f) => {
	f = files[f.id] = incomingFile(f)
	ui.emit('progress', f)
	f.on('status', () => ui.emit('progress', f))
	next()
})

ui.on('file', (f) => {
	f = files[f.id] = outgoingFile(f)
	ui.emit('progress', f)
	f.on('status', () => ui.emit('progress', f))
	list.send({id: f.id, name: f.name, size: f.size, type: f.type}, next)
})



const send = (f) => {
	console.log('sending', f.id)
	f.read().pipe(peers.data)
}
const receive = (f) => {
	console.log('receiving', f.id)
	const onData = (d) => f.write(d)
	peers.data.on('data', onData)
	peers.data.once('end', () => {
		peers.data.removeListener('data', onData)
		f.end()
	})
}



const commands = channel(peers.meta, 'commands')
let file = null

const next = () => {
	console.debug('next')
	if (file || !peers.initiator) return

	file = find(files, (file) => file.status === 'pending')
	if (!file) return

	commands.send(file.id, () => {
		if (file.mode === 'send') send(file)
		else receive(file)
	})
}

if (peers.initiator) peers.meta.on('connect', next)
if (!peers.initiator) commands.on('data', (id) => {
	file = files[id]
	if (!file) return console.error('unknown file', id)
	if (file.mode === 'send') send(file)
	else receive(file)
})



metaPeer.on('error', (e) => ui.emit('error', e.message))
