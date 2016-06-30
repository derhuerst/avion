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

const add = (f) => {
	if (f.id in files) Object.assign(files[f.id], f)
	else {
		files[f.id] = f
		f.on('status', () => ui.emit('progress', f))
	}
	ui.emit('progress', files[f.id])
}

list.on('data', (f) => {
	f = incomingFile(f)
	add(f)
	next()
})

ui.on('file', (f) => {
	f = outgoingFile(f)
	add(f)
	list.send({id: f.id, name: f.name, size: f.size, type: f.type}, next)
})

metaPeer.on('connect', () => {
	for (let id in files) {
		const f = files[id]
		list.send({id: f.id, name: f.name, size: f.size, type: f.type})
	}
})



const sync = channel(metaPeer, 'sync')
let file = null

const next = () => {
	if (file || !isLeader || !metaPeer.connected) return
	file = find(files, (f) => f.status === 'pending')
	if (!file) return

	sync.send(file.id, () => {
		transfer(dataPeer, channel(metaPeer, file.id), file, true)
		.catch((e) => ui.emit('error', e))
		.then(() => {file = null; next()})
	})
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
