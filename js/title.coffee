do (peer = window.peer) ->
	originalTitle = document.title

	displayTitle = () ->
		title = []    # parts of `document.title`

		if not peer.open and peer.mode is 'listen'
			title.push "##{peer.id}"

		progress = peer.status()
		if progress.all > 0 and peer.complete
			title.push '\u2713'
		if not peer.complete
			parts = []    # progress indicator parts
			if progress.receive.all > 0
				parts.push "\u2193#{progress.receive.complete}/#{progress.receive.all}"
			if progress.send.all > 0
				parts.push "\u2191#{progress.send.complete}/#{progress.send.all}"
			if parts.length > 0
				title.push parts.join '\u2002'

		title.push 'avion'
		document.title = title.join ' \u2014 '

	peer.on 'open', displayTitle
	peer.on 'close', displayTitle
	peer.on 'add', displayTitle
	peer.on 'remove', displayTitle
	peer.on 'progress', displayTitle
	peer.on 'transfer', displayTitle
	peer.on 'complete', displayTitle
	displayTitle()