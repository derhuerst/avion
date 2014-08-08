do (peer = window.peer) ->
	status = $ '#status'

	displayStatus = () ->
		if peer.isOpen
			status.text 'verbunden'
		else
			if peer.mode is 'listen'
				status.text 'auf eine Verbindung warten'
			else
				status.html "mit <i>##{peer.peer}<i> verbinden"

	peer.on 'open', displayStatus
	peer.on 'close', displayStatus
	displayStatus()