'use strict'

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
})

ui.on('file', (f) => {
	f = sentFile(f)
	files[f.id] = f
	ui.emit('progress', f)
	sync.send({id: f.id, name: f.name, size: f.size, type: f.type})
})



peers.meta.on('error', (e) => ui.emit('error', e.message))
// if (peers.initiator) peers.meta.on('connect', next)
