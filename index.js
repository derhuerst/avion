'use strict'

const generateId = require('alphanumeric-id')
const {WEBRTC_SUPPORT} = require('simple-peer')
const createEndpoint = require('files-sync-stream')
const diff = require('virtual-dom/diff')
const patch = require('virtual-dom/patch')
const createElement = require('virtual-dom/create-element')

const render = require('./lib/ui')
const fileReader = require('./lib/file-reader')
const writeFile = require('./lib/write-file')
const connect = require('./lib/connect')
const notify = require('./lib/notify')
const audio = require('./lib/audio')

if (!WEBRTC_SUPPORT) notify('error', 'Your browser is not supported.')

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
	file.on('progress', () => {
		audio.progress()
		rerender()
	})
	file.on('error', (err) => {
		console.log(err)
		notify('error', err.message || err.toString())
		rerender()
	})
	file.on('end', () => {
		audio.success()
		rerender()
	})
}

const init = () => {
	return Promise.all([
		connect(state.id, 'data', state.isLeader),
		connect(state.id, 'signaling', state.isLeader)
	])
	.then(([d, s]) => {
		const onConnect = () => {
			if (!d.connected || !s.connected) return
			d.removeListener('connect', onConnect)
			s.removeListener('connect', onConnect)

			const endpoint = createEndpoint(d, s, state.isLeader, 100 * 1000)
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
	})
	// todo: render pending state
}

const addFiles = (files) => {
	for (let file of files) {
		if (file.size > 10 * 1000 * 1000) {
			notify('warning', file.name + ' – Large files may not work!')
		}
	}

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

init()
.catch(console.error)
