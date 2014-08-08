window.peer = new linkup.Peer()


do (peer = window.peer) ->
	body = $ document.body

	# setup peer
	if location.hash.length > 1
		peer.connect location.hash.slice 1    # connect to peer
		peer.mode = 'connect'
	else
		peer.listen()    # listen for connections
		peer.mode = 'listen'

	peer.on 'open', () ->
		body.addClass 'open'
		body.removeClass 'closed'
		body.removeClass peer.mode
	peer.on 'close', () ->
		body.addClass 'closed'
		body.removeClass 'open'
		body.addClass peer.mode
	body.addClass peer.mode
	body.addClass if peer.open then 'open' else 'closed'