'use strict'

const progressEl = document.getElementById('progress')
const progress = () => {
	progressEl.pause()
	progressEl.currentTime = 0
	progressEl.play()
}

const successEl = document.getElementById('success')
const success = () => {
	successEl.pause()
	successEl.currentTime = 0
	successEl.play()
}

module.exports = {progress, success}
