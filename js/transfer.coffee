do (peer = window.peer) ->
	table = $ '#transfer tbody'

	prettyFileSize = (bytes) ->
		# How to Format Raw Byte File Size into a Humanly Readable Value Using PHP
		# http://www.stemkoski.com/how-to-format-raw-byte-file-size-into-a-humanly-readable-value-using-php/
		n = Math.floor (Math.log(bytes) / Math.log(1024))
		r = bytes / Math.pow 1024, n
		r *= Math.pow 10, n - 1
		r = Math.round (r)
		r /= Math.pow 10, n - 1
		# append metric
		return r + ['b','k','m','g','t'][n]

	updateEntry = () ->    # will be called with the `linkup.File` object as scope
		@dom.attr 'class', @status
		switch @status
			when 'init'
				@dom.status.html ''
			when 'wait'
				@dom.status.html '\u2026'    # unicode: …
			when 'transfer'
				if @mode is 'send'
					@dom.status.html '\u2191'    # unicode: ↑
				else
					@dom.status.html '\u2193'    # unicode: ↓
			when 'complete'
				@dom.status.html '\u2713'    # unicode: ✓
			when 'error'
				@dom.status.html '!'

	# add entries to the tranfer list
	peer.on 'add', (file) =>
		file.dom = $('<tr></tr>').attr 'id', file.id
		file.dom.name = $('<td></td>').addClass('name').html file.name
		file.dom.size = $('<td></td>').addClass('size').html prettyFileSize file.size
		file.dom.status = $('<td></td>').addClass('status')
		file.dom.append file.dom.name
		file.dom.append file.dom.size
		file.dom.append file.dom.status
		updateEntry.call file
		table.append file.dom

		file.on 'init', updateEntry.bind file
		file.on 'wait', updateEntry.bind file
		file.on 'transfer', updateEntry.bind file
		file.on 'complete', updateEntry.bind file
		file.on 'error', updateEntry.bind file

	# remove entries from the tranfer list
	peer.on 'remove', (file) ->
		$("##{file.id}").remove()