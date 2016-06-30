'use strict'



const transfer = (dataPeer, channel, file, isLeader) => {
	const onStart = () => {
		console.info(file.id + ':start')
		file.setStatus('running')
	}
	const onEnd = () => {
		console.info(file.id + ':end')
		file.setStatus('done')
	}
	const onError = () => {
		console.info(file.id + ':error')
		file.setStatus('failed')
	}


	channel.on('data', (e) => channel.emit(e))
	channel.once('start', onStart)
	channel.once('end', onEnd)
	channel.once('error', onError)


	const send = () => {
		const fail = (err) => {
			if (err) {channel.send('error'); onError()}
			else {channel.send('end'); onEnd()}
		}
		const next = () => {
			file.read()
			.then((chunk) => {
				dataPeer.send(chunk)
				channel.once('continue', () => {
					file.transferred += chunk.byteLength
					file.emit('progress')
					next()
				})
			}, fail)
		}
		next()
	}

	const receive = () => {
		const onChunk = (chunk) => {
			file.write(chunk)
			file.transferred += chunk.byteLength
			file.emit('progress')
			channel.send('continue')
		}
		dataPeer.on('data', onChunk)
		channel.on('error', () => dataPeer.removeListener('data', onChunk))
		channel.on('end', () => {
			dataPeer.removeListener('data', onChunk)
			file.end()
		})
	}

	const start = () => {
		if (file.mode === 'send') send()
		else if (file.mode === 'receive') receive()
		else console.error(file.id, 'unknown file mode', file.mode)
	}


	if (isLeader) channel.send('start', () => {
		onStart()
		start()
	})
	else channel.once('start', start)
}

module.exports = transfer
