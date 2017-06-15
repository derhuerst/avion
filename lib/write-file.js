'use strict'

const toArrayBuffer = require('buffer-to-arraybuffer')
const {saveAs} = require('file-saver')

const writeFile = (file) => {
	let blob = new Blob([], {type: file.meta.type})

	file.on('data', (chunk) => {
		blob = new Blob([blob, toArrayBuffer(chunk)], {type: file.meta.type})
	})

	file.on('end', () => {
		saveAs(blob, file.meta.name)
	})
}

module.exports = writeFile
