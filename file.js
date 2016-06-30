'use strict'

const Emitter = require('component-emitter')
const hash = require('shorthash')
const write = require('file-saver').saveAs



const wrap = (name, size, type, status) => {
	const file = new Emitter()
	Object.assign(file, {
		name, type, status, size, transferred: 0,
		id: hash.unique([name, size, type].join('/'))
	})
	file.setStatus = (status) => {
		file.status = status
		file.emit(status)
		file.emit('status', status)
	}
	return file
}



const sent = (f) => {
	const file = wrap(f.name, f.size, f.type, 'pending')
	file.mode = 'send'

	let i = 0
	const s = 1024 * 1024
	const l = Math.ceil(file.size / s)
	file.read = () => new Promise((yay, nay) => {
		if (i >= l) return nay(null)
		const blob = f.slice(i * s, Math.min((i + 1) * s, file.size), file.type)
		i++

		const reader = new FileReader()
		reader.onabort = nay
		reader.onerror = nay
		reader.onload = (chunk) => {
			if (reader.readyState === FileReader.DONE) yay(reader.result)
		}
		reader.readAsArrayBuffer(blob)
	})
	return file
}

const received = (f) => {
	const file = wrap(f.name, f.size, f.type, 'pending')
	file.mode = 'receive'

	const chunks = []
	file.write = (chunk) => {chunks.push(chunk)}
	file.end = () => {
		console.warn('end', chunks)
		write(new File(chunks, f.name, {type: f.type}))
	}
	return file
}



module.exports = {sent, received}
