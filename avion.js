'use strict'

const find = require('lodash.find')

const channel = require('./channel')
const peers = require('./peers')
const receivedFile = require('./file').received
const sentFile = require('./file').sent
const ui = require('./ui')



const sync = channel(peers.meta, 'sync')
const files = {} // by id



// meta <-> ui brige

sync.on('data', (f) => {
	f = receivedFile(f)
	files[f.id] = f
	ui.emit('progress', f)
	next()
})

ui.on('file', (f) => {
	f = sentFile(f)
	files[f.id] = f
	ui.emit('progress', f)
	sync.send({id: f.id, name: f.name, size: f.size, type: f.type}, next)
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
	if (!file) return ui.emit('done')

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



peers.meta.on('error', (e) => ui.emit('error', e.message))
