'use strict'

const el = document.getElementById('success')

const pling = () => {
	el.pause()
	el.currentTime = 0
	el.play()
}

module.exports = pling
