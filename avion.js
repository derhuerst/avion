'use strict'

const Emitter = require('component-emitter')
const hash = require('shorthash')
const pick = require('lodash.pick')
const channel = require('./channel')
const peers = require('./peers')
const ui = require('./ui')



const sync = channel(peers.meta, 'sync')
const files = {} // by id


// meta <-> ui brige
sync.on('data', (f) => {
	if (f.id in files) Object.assign(files[f.id], f)
	else files[f.id] = f
	ui.emit('progress', files[f.id])
})
ui.on('file', (f) => {
	f.id = hash.unique([f.name, f.size, f.lastModified, f.type].join(','))
	files[f.id] = f
	f.status = 'queued'
	ui.emit('progress', f)
	sync.send(pick(f, ['id', 'name', 'size', 'status']))
})



peers.meta.on('error', (e) => ui.emit('error', e.message))
// if (peers.initiator) peers.meta.on('connect', next)
