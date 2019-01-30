'use strict'

const notify = require('./notify')

const getUserMedia = (constraints, timeout) => {
	return new Promise((resolve, reject) => {
		setTimeout(reject, timeout, new Error('timeout'))
		if (navigator.mediaDevices) {
			navigator.mediaDevices.getUserMedia(constraints)
			.then(resolve, reject)
		}
		return new Promise((resolve, reject) => {
			navigator.getUserMedia(constraints, resolve, reject)
		})
	})
}

const requestUserMediaPermission = () => {
	notify('hint', 'avion would like to access your microphone to get the IP address of your computer. This is optional and a temporary workaround for a browser limitation.')

	// We ask for user media permission to let the browser send IP address
	// ICE offers in the WebRTC handshake process. This raises the chance
	// of both peers finding each other.
	// See https://tools.ietf.org/html/draft-mdns-ice-candidates-00#section-1
	// todo: show explanation to user
	// todo: remove this once https://tools.ietf.org/html/draft-mdns-ice-candidates-00 is widely supported
	return getUserMedia({audio: true}, 5000)
	.then((stream) => {
		// Explicitly stop the user media stream, we're not interested.
		for (const track of stream.getTracks()) track.stop()
		if (stream.stop) stream.stop()
	})
}

module.exports = requestUserMediaPermission
