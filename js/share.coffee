do (peer = window.peer) ->
	share = $ '#share-input'
	share.attr 'value', "#{location.href}##{peer.id}"

	share.on 'click', () ->
		@select()
		@setSelectionRange 0, 100