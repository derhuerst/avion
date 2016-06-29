'use strict'

const Emitter = require('component-emitter')



const $ = (s) => document.querySelector(s)

const dom = (tag, props) => {
	const el = document.createElement(tag)
	for (let key in props) el.setAttribute(key, props[key])
	return el
}

const metrics = ['b','k','m','g','t']
const prettySize = (bytes) => {
	// How to Format Raw Byte File Size into a Humanly Readable Value Using PHP
	// http://www.stemkoski.com/how-to-format-raw-byte-file-size-into-a-humanly-readable-value-using-php/
	const n = Math.floor(Math.log(bytes) / Math.log(1024))
	let r = bytes / Math.pow(1024, n)
	r *= Math.pow(10, n - 1)
	r = Math.round(r)
	r /= Math.pow(10, n - 1)
	return r + metrics[n]
}

const ui = new Emitter()
module.exports = ui



const select = $('#add-select input')

select.addEventListener('change', (e) => {
	console.debug('files', e.target.files)
	for (let file of Array.from(e.target.files)) ui.emit('file', file)
})

const drop = $('#add-drop')

drop.addEventListener('dragover', (e) => {
	e.preventDefault()
	e.dataTransfer.dropEffect = 'copy'
})
drop.addEventListener('drop', (e) => {
	e.preventDefault()
	console.debug('files', e.dataTransfer.files)
	for (let file of e.dataTransfer.files) ui.emit('file', file)
})



const link = $('#link-input')

link.addEventListener('click', () => {
	link.select()
	link.setSelectionRange(0, link.value.length)
})
ui.on('id', (id) => {
	link.value = `${location.href}#${id}`
})



const transfers = $('#transfer tbody')

const statuses = {queued: '…', running: '●', done: '✓', failed: '✗'}
const files = {} // DOM elements by file id

ui.on('progress', (file) => {
	console.debug('progress', file)
	if (file.id in files) {
		const row = $('transfer-' + file.id)
		row.setAttribute('class', file.status)
		row._.status.innerHTML = statuses[file.status]
	} else {
		const row = dom('tr', {id: 'transfer-' + file.id, class: file.status})

		const name = dom('td', {class: 'name'})
		name.innerHTML = file.name
		row.appendChild(name)

		const size = dom('td', {class: 'size'})
		size.innerHTML = prettySize(file.size)
		row.appendChild(size)

		const status = dom('td', {class: 'status'})
		status.innerHTML = statuses.queued
		row.appendChild(status)

		row._ = {name, size, status}
		transfers.appendChild(row)
	}
})



const audio = $('#pling')
audio.volume = .3

ui.on('progress', (file) => {
	if (file.status !== 'done') return
	audio.pause()
	audio.currentTime = 0
	audio.play()
})



ui.on('error', (msg) => notify('error', msg))
const notify = (type, msg) => {
	const notification = dom('p', {class: 'notification ' + type})
	notification.innerHTML = msg
	document.body.appendChild(notification)
	setTimeout(() => document.body.removeChild(notification), 4000)
}



const warn = () => 'There are files that haven\'t been transferred yet.'
ui.on('start', () => {window.onbeforeunload = warn})
ui.on('done', () => {window.onbeforeunload = null})
