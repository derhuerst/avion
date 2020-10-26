'use strict'

const progressEl = document.getElementById('progress')
const progress = () => {
	try {
		progressEl.pause()
		progressEl.currentTime = 0
		progressEl.play().catch(() => {})
	} catch (e) {}
}

const successEl = document.getElementById('success')
const success = () => {
	try {
		successEl.pause()
		successEl.currentTime = 0
		successEl.play().catch(() => {})
	} catch (e) {}
}

module.exports = {progress, success}
