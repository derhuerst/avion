do (peer = window.peer) ->
	# file select
	button = $ '#select-button input'
	button.on 'change', (e) ->
		# todo: folders
		for file in e.target.files
			peer.send file

	# file drop
	drop = $ '#select-drop'
	drop.on 'dragenter', (e) ->
		drop.addClass 'hover'
	drop.on 'dragleave', (e) ->
		drop.removeClass 'hover'
	drop.on 'dragover', (e) ->
		e.preventDefault()    # chrome & safari fix; otherwise, drop doesnt fire
		e.dataTransfer.dropEffect = 'copy'
	drop.on 'drop', (e) ->
		e.preventDefault()
		# todo: folders
		drop.removeClass 'hover'
		for file in e.dataTransfer.files
			peer.send file