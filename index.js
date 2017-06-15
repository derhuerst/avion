'use strict'

const generateId = require('alphanumeric-id')
const createEndpoint = require('files-sync-stream')
const diff = require('virtual-dom/diff')
const patch = require('virtual-dom/patch')
const createElement = require('virtual-dom/create-element')

const render = require('./lib/ui')
const fileReader = require('./lib/file-reader')
const writeFile = require('./lib/write-file')
const connect = require('./lib/connect')
const notify = require('./lib/notify')
const pling = require('./lib/pling')

const state = {
	id: location.hash.length === 7 ? location.hash.slice(1) : generateId(6),
	isLeader: location.hash.length === 7,
	dataPeer: null,
	signalingPeer: null,
	endpoint: null,
	filesToAdd: []
}

const addFilesToEndpoint = (files) => {
	for (let file of files) {
		const handle = state.endpoint.add(fileReader(file), {
			name: file.name,
			size: file.size,
			type: file.type
		})
		onFile(handle)
	}
}

const onFile = (file, isIncoming = false) => {
	if (isIncoming) writeFile(file)

	file.on('start', rerender)
	file.on('data', rerender)
	file.on('end', () => {
		pling()
		rerender()
	})
}

const init = () => {
	const d = connect(state.id, 'data', state.isLeader)
	const s = connect(state.id, 'signaling', state.isLeader)

	const onConnect = () => {
		if (d.connected && s.connected) {
			d.removeListener('connect', onConnect)
			s.removeListener('connect', onConnect)
		}

		const endpoint = createEndpoint(d, s, state.isLeader)
		state.endpoint = endpoint

		addFilesToEndpoint(state.filesToAdd)
		endpoint.on('file', (file) => {
			onFile(file, true)
			rerender()
		})
		endpoint.on('done', rerender)

		notify('hint', 'You are connected.')
		rerender()
	}
	d.on('connect', onConnect)
	s.on('connect', onConnect)

	const onClose = () => {
		// todo: handle disconnects properly
		notify('hint', 'You are disconnected.')
	}
	d.on('close', onClose)
	s.on('close', onClose)

	const onError = (err) => notify('error', err.message || err.toString())
	d.on('error', onError)
	s.on('error', onError)

	state.dataPeer = d
	state.signalingPeer = s
	rerender()
}

const addFiles = (files) => {
	if (state.endpoint) addFilesToEndpoint(files)
	else state.filesToAdd.push(...files)

	rerender()
}

const actions = {addFiles}

let tree = render(state, actions)
let root = createElement(tree)
document.getElementById('app').appendChild(root)

const rerender = () => {
	const newTree = render(state, actions)
	root = patch(root, diff(tree, newTree))
	tree = newTree
}

setTimeout(init, 0)
