'use strict'

const Emitter = require('component-emitter')
const hash = require('shorthash')
const read = require('filereader-stream')
const write = require('file-saver')



const wrap = (name, size, type, status) => {
	const file = new Emitter()
	Object.assign(file, {
		name, size, type, status,
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

	file.read = () => {
		file.setStatus('running')
		const stream = read(f)
		stream.on('error', (e) => {
			console.error(file.id + ':error', e)
			file.setStatus('failed')
			file.emit('change')
		})
		stream.on('end', () => {
			console.debug(file.id + ':end')
			file.setStatus('done')
			file.emit('change')
		})
		return stream
	}
	return file
}

const received = (f) => {
	const file = wrap(f.name, f.size, f.type, 'pending')
	file.mode = 'receive'

	const chunks = []
	file.write = (chunk) => {
		file.setStatus('running')
		chunks.push(chunk)
	}
	file.end = () => {
		write(new File(chunks, f.name, {type: f.type}))
		file.setStatus('done')
	}
	return file
}



module.exports = {sent, received}
