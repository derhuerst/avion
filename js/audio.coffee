do (peer = window.peer) ->
	audio = $('#audio')[0]
	audio.volume = 0.3

	peer.on 'progress', () ->
		audio.pause()
		audio.currentTime = 0
		audio.play()