'use strict'

const find = require('lodash.find')
const every = require('lodash.every')

const channel = require('./lib/channel')
const ui = require('./lib/ui')
const incomingFile = require('./lib/file').received
const outgoingFile = require('./lib/file').sent
const transfer = require('./lib/transfer')

const id = require('./lib/peers').channel
const isLeader = require('./lib/peers').initiator
const metaPeer = require('./lib/peers').meta
const dataPeer = require('./lib/peers').data



const list = channel(metaPeer, 'list')
const files = {} // by id

const pending = (f) => f.status === 'pending'
const doneOrFailed = (f) => f.status === 'done' || f.status === 'failed'



// metaPeer <-> ui brige

const add = (f) => {
	if (Object.keys(files).length === 0) ui.emit('start')
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
	file = find(files, pending)
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
ui.emit('id', id)
metaPeer.on('connect', () => {if (dataPeer.connected) ui.emit('connect')})
dataPeer.on('connect', () => {if (metaPeer.connected) ui.emit('connect')})
metaPeer.on('close', () => ui.emit('disconnect'))
dataPeer.on('close', () => ui.emit('disconnect'))
metaPeer.on('error', () => ui.emit('disconnect'))
dataPeer.on('error', () => ui.emit('disconnect'))



ui.on('progress', () => {if (every(files, doneOrFailed)) ui.emit('done')})
metaPeer.on('error', (e) => ui.emit('error', e.message))
if (isLeader) metaPeer.on('connect', next)
