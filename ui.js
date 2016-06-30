'use strict'

const Emitter = require('component-emitter')



const $ = (s) => document.querySelector(s)

const dom = (tag, props) => {
	const el = document.createElement(tag)
	for (let key in props) el.setAttribute(key, props[key])
	return el
}

const metrics = ['b','kb','mb','gb']
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
	for (let file of Array.from(e.target.files))
		ui.emit('file', file)
})



const drop = $('#add-drop')

const nope = (e) => {e.stopPropagation(); e.preventDefault(); return false}
drop.addEventListener('dragenter', nope)
drop.addEventListener('dragover', nope)

drop.addEventListener('dragover', (e) => {
	e.dataTransfer.dropEffect = 'copy'
})
drop.addEventListener('drop', (e) => {
	e.preventDefault()
	for (let file of e.dataTransfer.files)
		ui.emit('file', file)
})



const link = $('#link-input')

link.addEventListener('click', () => {
	link.select()
	link.setSelectionRange(0, link.value.length)
})
ui.on('id', (id) => {link.value = `${location.href}#${id}`})
ui.hideLink = () => $('#link').style.display = 'none'



const transfers = $('#transfer tbody')

const statuses = {pending: '…', running: '●', done: '✓', failed: '✗'}
const files = {} // DOM elements by file id

ui.on('progress', (file) => {
	console.debug('progress', file)

	if (file.id in files) {
		const row = files[file.id]
		row.setAttribute('class', file.status)
		row._.status.innerHTML = statuses[file.status]

	} else {
		file.on('progress', () => {
			const el = files[file.id]._.status
			el.innerHTML = Math.round(100 * file.transferred / file.size) + '%'
		})
		file.on('done', () => sound(success))

		const row = dom('tr', {id: 'transfer-' + file.id, class: file.status})
		files[file.id] = row

		const name = dom('td', {class: 'name'})
		name.innerHTML = file.name
		row.appendChild(name)

		const size = dom('td', {class: 'size'})
		size.innerHTML = prettySize(file.size)
		row.appendChild(size)

		const status = dom('td', {class: 'status'})
		status.innerHTML = statuses.pending
		row.appendChild(status)

		row._ = {name, size, status}
		transfers.appendChild(row)
	}
})



const success = $('#success')
success.volume = 1

const sound = (el) => {
	el.pause()
	el.currentTime = 0
	el.play()
}



const notify = (type, msg) => {
	const notification = dom('p', {class: 'notification ' + type})
	notification.innerHTML = msg
	document.body.appendChild(notification)
	setTimeout(() => document.body.removeChild(notification), 4000)
}
ui.on('error', (msg) => notify('error', msg))



let title = 'avion'
ui.on('id', (id) => {document.title = title = id + ' – avion'})

ui.on('progress', (file) => {
	let done = 0
	for (let id in files) {
		if (files[id].getAttribute('class') === 'done') done++
	}
	document.title = done + '/' + Object.keys(files).length + ' – ' + title
})



ui.on('connect', () => notify('hint', 'You are connected.'))
const warn = () => 'There are files that haven\'t been transferred yet.'
ui.on('start', () => {window.onbeforeunload = warn})
ui.on('done', () => {window.onbeforeunload = null})
