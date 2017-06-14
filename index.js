'use strict'

const generateId = require('alphanumeric-id')
const diff = require('virtual-dom/diff')
const patch = require('virtual-dom/patch')
const createElement = require('virtual-dom/create-element')

const render = require('./lib/ui')

const state = {
	id: location.hash.length === 7 ? location.hash.slice(1) : generateId(6),
	isLeader: location.hash.length === 7,
	endpoint: null
}

const addFiles = (files) => {
	// todo
}

const actions = {addFiles}

let tree = render(state, actions)
let root = createElement(tree)
document.getElementById('app').appendChild(root)

const rerender = () => {
	const newTree = render(state, actions)
	root = patch(root, diff(tree, newTree))
	tree = newTree
}
