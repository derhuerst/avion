'use strict'

const toBuffer = require('blob-to-buffer')

const fileReader = (file) => {
	let offset = 0
	const read = (size, cb) => {
		if (offset >= file.size) return setTimeout(cb, 0, null, null)

		const end = Math.min(offset + size, file.size)
		const blob = file.slice(offset, end)
		offset = end

		toBuffer(blob, (err, buf) => {
			if (err) cb(err)
			else cb(null, buf)
		})
	}

	return read
}

module.exports = fileReader
