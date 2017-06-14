'use strict'

const h = require('virtual-dom/h')

const nope = (e) => {
	e.stopPropagation()
	e.preventDefault()
	return false
}

const renderAdd = (state, actions) => {
	return h('div', {id: 'add'}, [
		h('div', {id: 'add-select'}, [
			h('input', {
				type: 'file',
				tabindex: '1',
				multiple: true,
				autofocus: true,
				onchange: (e) => {
					actions.addFiles(Array.from(e.target.files))
				}
			}),
			h('label', {}, 'select files')
		]),
		h('div', {
			id: 'add-drop',
			ondragenter: nope,
			ondragover: (e) => {
				e.dataTransfer.dropEffect = 'copy'
				nope(e)
			},
			ondrop: (e) => {
				nope(e)
				actions.addFiles(e.dataTransfer.files)
			}
		}, 'or drop them here')
	])
}

const selectAll = (e) => {
	e.target.select()
	e.target.setSelectionRange(0, e.target.value.length)
}

const renderLink = (state, actions) => {
	if (!state.id || state.isLeader) return null

	return h('div', {id: 'link'}, [
		h('p', {}, 'Share the link below. Keep this tab open until all files have been sent.'),
		h('input', {
			id: 'link-input',
			type: 'url',
			value: location.href + '#' + state.id,
			onclick: selectAll
		})
	])
}

// <table id="transfer"><tbody></tbody></table>

const ui = (state, actions) => {
	return h('div', {}, [
		renderAdd(state, actions),
		renderLink(state, actions)
	])
}

module.exports = ui
