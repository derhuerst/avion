'use strict'

// todo: this is ugly
const dom = (tag, props) => {
	const el = document.createElement(tag)
	for (let key in props) el.setAttribute(key, props[key])
	return el
}

const notify = (type, msg) => {
	const el = dom('p', {class: 'notification ' + type})
	el.innerText = msg
	document.body.appendChild(el)
	setTimeout(() => document.body.removeChild(el), 4000)
}

module.exports = notify
