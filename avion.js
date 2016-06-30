'use strict'

const find = require('lodash.find')

const channel = require('./channel')
const ui = require('./ui')
const incomingFile = require('./file').received
const outgoingFile = require('./file').sent
const transfer = require('./transfer')

const id = require('./peers').channel
const isLeader = require('./peers').initiator
const metaPeer = require('./peers').meta
const dataPeer = require('./peers').data



const list = channel(metaPeer, 'list')
const files = {} // by id



// metaPeer <-> ui brige

list.on('data', (f) => {
	f = incomingFile(f)
	files[f.id] = f
	ui.emit('progress', f)
	f.on('status', () => ui.emit('progress', f))
	next()
})

ui.on('file', (f) => {
	f = files[f.id] = outgoingFile(f)
	files[f.id] = f
	ui.emit('progress', f)
	f.on('status', () => ui.emit('progress', f))
	list.send({id: f.id, name: f.name, size: f.size, type: f.type}, next)
})



const sync = channel(metaPeer, 'sync')
let file = null

const next = () => {
	if (file || !isLeader) return
	file = find(files, (file) => file.status === 'pending')
	if (!file) return

	sync.send(file.id, () =>
		transfer(dataPeer, channel(metaPeer, file.id), file, true))
		.catch((e) => ui.emit('error', e))
}

if (!isLeader) sync.on('data', (id) => {
	if (!files[id]) return
	file = files[id]

	transfer(dataPeer, channel(metaPeer, file.id), file, false)
})



if (isLeader) ui.hideLink()
ui.setId(id)
metaPeer.once('connect', () => {if (dataPeer.connected) ui.emit('connect')})
dataPeer.once('connect', () => {if (metaPeer.connected) ui.emit('connect')})



metaPeer.on('error', (e) => ui.emit('error', e.message))
if (isLeader) metaPeer.on('connect', next)
