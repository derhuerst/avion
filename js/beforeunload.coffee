do (peer = window.peer) ->
	countUnsentFiles = () ->
		status = peer.status()
		return status.all - status.complete - status.error
	unsentFiles = countUnsentFiles()

	# efficiency
	peer.on 'add', () ->
		unsentFiles++
	peer.on 'remove', () ->
		unsentFiles--
	peer.on 'progress', () ->
		unsentFiles--

	# onBeforeUnload
	onBeforeUnload = () ->
		return "Möchtest du die Seite verlassen und die Übertragung von #{countUnsentFiles()} Dateien abbrechen?"

	# binding and unbinding `onBeforeUnload`
	peer.on 'add', () ->
		if unsentFiles is 1    # was 0 before
			window.onbeforeunload = onBeforeUnload
	peer.on 'remove', () ->
		if unsentFiles is 0    # was 1 before
			window.onbeforeunload = null
	peer.on 'progress', () ->
		if unsentFiles is 0    # was 1 before
			window.onbeforeunload = null