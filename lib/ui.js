'use strict'

const h = require('virtual-dom/h')

const nope = (e) => {
	e.stopPropagation()
	e.preventDefault()
	return false
}

const renderAdd = (state, actions) => {
	return h('div', {id: 'add'}, [
		h('div', {id: 'add-select'}, [
			h('input', {
				type: 'file',
				tabindex: '1',
				multiple: true,
				autofocus: true,
				onchange: (e) => {
					actions.addFiles(Array.from(e.target.files))
				}
			}),
			h('label', {}, 'select files')
		]),
		h('div', {
			id: 'add-drop',
			ondragenter: nope,
			ondragover: (e) => {
				e.dataTransfer.dropEffect = 'copy'
				nope(e)
			},
			ondrop: (e) => {
				nope(e)
				actions.addFiles(e.dataTransfer.files)
			}
		}, 'or drop them here')
	])
}

const selectAll = (e) => {
	e.target.select()
	e.target.setSelectionRange(0, e.target.value.length)
}

const renderLink = (state, actions) => {
	if (!state.id || state.isLeader || state.endpoint) return null

	return h('div', {id: 'link'}, [
		h('p', {}, 'Share the link below. Keep this tab open until all files have been sent.'),
		h('input', {
			id: 'link-input',
			type: 'url',
			value: location.href + '#' + state.id,
			onclick: selectAll
		})
	])
}

const indicators = {
	queued: '…',
	active: '●',
	done: '✓',
	failed: '✗'
}

const metrics = ['b','kb','mb','gb']
const formatSize = (bytes) => {
	// How to Format Raw Byte File Size into a Humanly Readable Value Using PHP
	// http://www.stemkoski.com/how-to-format-raw-byte-file-size-into-a-humanly-readable-value-using-php/
	const n = Math.floor(Math.log(bytes) / Math.log(1024))
	let r = bytes / Math.pow(1024, n)
	r *= Math.pow(10, n - 1)
	r = Math.round(r)
	r /= Math.pow(10, n - 1)
	return r + metrics[n]
}

const renderFile = (id, name, size, status, progress = 0) => {
	// if (progress) console.log(progress, size)
	const indicator = status === 'queued' && progress > 0
		? Math.round(100 * progress / size) + '%'
		: indicators[status]

	return h('tr', {
		id: 'transfer-' + id,
		className: status
	}, [
		h('td', {className: 'name'}, name),
		h('td', {className: 'size'}, formatSize(size)),
		h('td', {className: 'status'}, indicator)
	])
}

const renderTransfer = (state, actions) => {
	const rows = []

	if (state.endpoint) {
		for (let id in state.endpoint.files) {
			const f = state.endpoint.files[id]
			rows.push(renderFile(f.id, f.meta.name, f.meta.size, f.status, f.bytesTransferred))
		}
	} else if (state.filesToAdd.length > 0) {
		for (let file of state.filesToAdd) {
			rows.push(renderFile('_', file.name, file.size, 'queued'))
		}
	} else return null

	return h('table', {id: 'transfer'}, [
		h('rbody', {}, rows)
	])
}

const ui = (state, actions) => {
	return h('div', {}, [
		renderAdd(state, actions),
		renderLink(state, actions),
		renderTransfer(state, actions)
	])
}

module.exports = ui
