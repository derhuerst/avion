!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.linkup=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var EventEmitter;

EventEmitter = (function() {
  EventEmitter.prototype._events = null;

  function EventEmitter() {
    this._events = {};
  }

  EventEmitter.prototype.emit = function(event, data) {
    var handler, _i, _len, _ref;
    if (this._events[event]) {
      _ref = this._events[event];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        handler = _ref[_i];
        handler.call(this, data);
      }
    }
    return this;
  };

  EventEmitter.prototype.on = function(event, handler) {
    var _base;
    if ((_base = this._events)[event] == null) {
      _base[event] = [];
    }
    return this._events[event].push(handler);
  };

  EventEmitter.prototype.once = function(event, handler) {
    var fn;
    fn = function(data) {
      this.removeListener(event, fn);
      return handler(data);
    };
    return this.on(event, fn);
  };

  return EventEmitter;

})();

module.exports = EventEmitter;


},{}],2:[function(_dereq_,module,exports){
var EventEmitter, File, uid,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

uid = _dereq_('./uid.coffee');

EventEmitter = _dereq_('./EventEmitter.coffee');

File = (function(_super) {
  __extends(File, _super);

  File.prototype.id = null;

  File.prototype.mode = null;

  File.prototype.status = null;

  File.prototype.file = null;

  File.prototype.name = null;

  File.prototype.size = null;

  File.prototype.type = null;

  function File(options) {
    File.__super__.constructor.apply(this, arguments);
    this.id = options.id || uid(9);
    if (options instanceof window.File) {
      this.file = options;
      this.mode = 'send';
    } else if (options.file instanceof window.File) {
      this.file = options.file;
      this.mode = 'send';
    } else {
      this.mode = 'receive';
    }
    this.name = options.name || this.file.name;
    this.size = options.size || this.file.size;
    this.type = options.type || this.file.type;
    this.on('init', (function(_this) {
      return function() {
        return _this.status = 'init';
      };
    })(this));
    this.on('wait', (function(_this) {
      return function() {
        return _this.status = 'wait';
      };
    })(this));
    this.on('transfer', (function(_this) {
      return function() {
        return _this.status = 'transfer';
      };
    })(this));
    this.on('complete', (function(_this) {
      return function() {
        return _this.status = 'complete';
      };
    })(this));
    this.on('error', (function(_this) {
      return function() {
        return _this.status = 'error';
      };
    })(this));
    this.emit('init');
  }

  File.prototype.readAsBuffer = function(callback) {
    var reader;
    reader = new FileReader();
    reader.onload = function() {
      return callback(reader.result);
    };
    return reader.readAsArrayBuffer(this.file);
  };

  File.prototype.saveFromBuffer = function(buffer) {
    var blob;
    blob = new Blob([buffer], {
      type: this.type
    });
    return saveAs(blob, this.name);
  };

  return File;

})(EventEmitter);

module.exports = File;


},{"./EventEmitter.coffee":1,"./uid.coffee":5}],3:[function(_dereq_,module,exports){
var EventEmitter, File, Peer, uid,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

uid = _dereq_('./uid.coffee');

EventEmitter = _dereq_('./EventEmitter.coffee');

File = _dereq_('./File.coffee');

Peer = (function(_super) {
  __extends(Peer, _super);

  Peer.prototype.id = null;

  Peer.prototype.peer = null;

  Peer.prototype._peerjs = null;

  Peer.prototype._commandConnection = null;

  Peer.prototype._dataConnection = null;

  Peer.prototype.isController = null;

  Peer.prototype.isOpen = null;

  Peer.prototype.isIdle = null;

  Peer.prototype.files = null;

  Peer.prototype.currentFile = null;

  function Peer() {
    this._onData = __bind(this._onData, this);
    this._onCommand = __bind(this._onCommand, this);
    Peer.__super__.constructor.apply(this, arguments);
    this.id = uid(6);
    this.on('open', function() {
      this.isOpen = true;
      return this.isIdle = false;
    });
    this.on('close', function() {
      this.isOpen = false;
      return this.isIdle = false;
    });
    this.on('error', function() {
      this.isOpen = false;
      return this.isIdle = false;
    });
    this.on('complete', function() {
      return this.isIdle = true;
    });
    this.on('transfer', function() {
      return this.isIdle = false;
    });
    this._peerjs = new window.Peer(this.id, {
      key: '2c5evmxvq0i442t9'
    });
    this._peerjs.on('close', (function(_this) {
      return function() {
        _this._log('underlying PeerJS peer closed');
        return _this.emit('close');
      };
    })(this));
    this._peerjs.on('error', (function(_this) {
      return function(error) {
        _this._log("underlying PeerJS peer throw an error: " + error, 'error');
        return _this.emit('error', error);
      };
    })(this));
    this.files = [];
    this.on('open', this._onOpen);
    this.on('open', function() {
      return this._log('connection open');
    });
    this.on('close', this._onClose);
    this.on('close', function() {
      return this._log('connection closed');
    });
    this.on('error', this._onClose);
    this.on('error', function() {
      return this._log('connection closed due to an error');
    });
    this.on('add', function(file) {
      return this._log("file added: " + file.name);
    });
    this.on('add', this._checkSendCommand);
    this.on('progress', this._checkSendCommand);
    this.on('open', this._checkSendCommand);
    this.emit('close');
  }

  Peer.prototype.connect = function(id) {
    var onOpen;
    this._log("connecting to peer " + id);
    this.isController = false;
    onOpen = (function(_this) {
      return function() {
        _this._commandConnection = _this._peerjs.connect(_this.peer, {
          label: 'messages',
          serialization: 'none',
          reliable: true
        });
        _this._onConnection(_this._commandConnection);
        _this._dataConnection = _this._peerjs.connect(_this.peer, {
          label: 'data',
          serialization: 'binary',
          reliable: true
        });
        return _this._onConnection(_this._dataConnection);
      };
    })(this);
    this.peer = id;
    if (this._peerjs.open) {
      return onOpen();
    }
    return this._peerjs.on('open', onOpen);
  };

  Peer.prototype.listen = function() {
    var onConnection;
    this._log('listening for connections');
    this.isController = true;
    onConnection = (function(_this) {
      return function(connection) {
        var connections, _ref;
        connections = {
          'messages': '_commandConnection',
          'data': '_dataConnection'
        };
        if (_ref = !connection, __indexOf.call(connections, _ref) >= 0) {
          return _this._log("request with invalid label `" + connection.label + "`", 'warn');
        }
        if (_this[connections[connection.label]] && _this[connections[connection.label]].open) {
          connection.close();
          return _this._log("" + connection.label + " connection already established", 'warn');
        }
        _this.peer = connection.peer;
        _this[connections[connection.label]] = connection;
        return _this._onConnection(connection);
      };
    })(this);
    return this._peerjs.on('connection', onConnection);
  };

  Peer.prototype._onConnection = function(connection) {
    var onCloseOrError, onOpen;
    onOpen = (function(_this) {
      return function() {
        if (!_this._commandConnection || !_this._commandConnection.open) {
          return;
        }
        if (!_this._dataConnection || !_this._dataConnection.open) {
          return;
        }
        _this._commandConnection.on('data', _this._onCommand);
        _this._dataConnection.on('data', _this._onData);
        return _this.emit('open');
      };
    })(this);
    onCloseOrError = (function(_this) {
      return function() {
        return _this.emit('close');
      };
    })(this);
    if (connection.open) {
      onOpen();
    }
    connection.on('open', onOpen);
    connection.on('close', onCloseOrError);
    return connection.on('error', onCloseOrError);
  };

  Peer.prototype.add = function(file) {
    if (__indexOf.call(this.files, file) >= 0) {
      return;
    }
    this.files.push(file);
    this.files[file.id] = file;
    if (file.mode === 'send' && this.isOpen) {
      this._sendCommand('metadata', file, {
        name: file.name,
        size: file.size,
        type: file.type
      });
    }
    file.emit('wait');
    return this.emit('add', file);
  };

  Peer.prototype.send = function(file) {
    file = new linkup.File(file);
    this.add(file);
    return file;
  };

  Peer.prototype.remove = function(file) {
    if (this.currentFile === file) {
      this._log("" + file.name + ": currently being transferred; cannot remove", 'error');
    }
    delete this.files[file.id];
    this.files.splice(this.files.indexOf(file), 1);
    file.emit('init');
    return this.emit('remove', file);
  };

  Peer.prototype.status = function() {
    var data, file, _i, _len, _ref;
    data = {
      init: 0,
      wait: 0,
      transfer: 0,
      complete: 0,
      error: 0,
      all: 0,
      send: {
        init: 0,
        wait: 0,
        transfer: 0,
        complete: 0,
        error: 0,
        all: 0
      },
      receive: {
        init: 0,
        wait: 0,
        transfer: 0,
        complete: 0,
        error: 0,
        all: 0
      }
    };
    _ref = this.files;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      file = _ref[_i];
      data[file.status]++;
      data.all++;
      data[file.mode][file.status]++;
      data[file.mode].all++;
    }
    return data;
  };

  Peer.prototype._onOpen = function() {
    var file, _i, _len, _ref, _results;
    _ref = this.files;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      file = _ref[_i];
      if (file.status === 'init') {
        _results.push(this._sendCommand('metadata', file, {
          name: file.name,
          size: file.size,
          type: file.type
        }));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Peer.prototype._onClose = function() {
    var file, _i, _len, _ref;
    _ref = this.files;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      file = _ref[_i];
      if (file.status !== 'complete') {
        file.emit('error');
      }
    }
    if (this._messages && this._messages.open) {
      this._messages.close();
    }
    this._messages = null;
    if (this._data && this._data.open) {
      this._data.close();
    }
    return this._data = null;
  };

  Peer.prototype._sendCommand = function(command, file, payload) {
    if (payload == null) {
      payload = {};
    }
    payload.id = file.id;
    payload.command = command;
    console.log(payload);
    this._commandConnection.send(JSON.stringify(payload));
    return this._log("" + file.name + ": `" + command + "` command sent");
  };

  Peer.prototype._onCommand = function(data) {
    var file;
    data = JSON.parse(data);
    file = this.files[data.id] || null;
    this._log(data);
    this._log(this.files);
    this._log("" + (file ? file.name : data.name) + ": `" + data.command + "` command received");
    switch (data.command) {
      case 'metadata':
        file = new File({
          id: data.id,
          mode: 'receive',
          name: data.name,
          size: data.size,
          type: data.type
        });
        return this.add(file);
      case 'receive':
        this.currentFile = file;
        return file.emit('transfer');
      case 'send':
        this.currentFile = file;
        file.emit('transfer');
        return this._sendData(file);
      case 'ack':
        file.emit('complete');
        this.currentFile = null;
        return this.emit('progress', file);
      default:
        return this._log("invalid command: " + data.command, 'error');
    }
  };

  Peer.prototype._sendData = function(file) {
    file.readAsBuffer((function(_this) {
      return function(buffer) {
        return _this._dataConnection.send(buffer);
      };
    })(this));
    return this._log("" + file.name + ": sending data");
  };

  Peer.prototype._onData = function(buffer) {
    var file;
    file = this.currentFile;
    this._log("" + file.name + ": data received");
    this._sendCommand('ack', file);
    this.currentFile = null;
    file.saveFromBuffer(buffer);
    file.emit('complete');
    return this.emit('progress', file);
  };

  Peer.prototype._checkSendCommand = function(file) {
    var _i, _len, _ref;
    this._log('_checkSendCommand');
    if (!this.isOpen) {
      return;
    }
    if (this.currentFile) {
      return;
    }
    if (this.isController) {
      _ref = this.files;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        if (file.status === 'wait') {
          if (this.idle) {
            this.idle = false;
            this.emit('transfer');
          }
          this.currentFile = file;
          if (file.mode === 'send') {
            this._sendCommand('metadata', file, {
              name: file.name,
              size: file.size,
              type: file.type
            });
            setTimeout((function(_this) {
              return function() {
                _this._sendCommand('receive', file);
                return _this._sendData(file);
              };
            })(this), 100);
          } else {
            this._sendCommand('send', file);
          }
          file.emit('transfer');
          return;
        }
      }
    }
    if (!this.idle) {
      this.idle = true;
      return this.emit('complete');
    }
  };

  Peer.prototype._log = function(message, level) {
    if (level == null) {
      level = 'info';
    }
    return console[level]("[linkup." + this.constructor.name + " #" + this.id + "] ", message);
  };

  return Peer;

})(EventEmitter);

module.exports = Peer;


},{"./EventEmitter.coffee":1,"./File.coffee":2,"./uid.coffee":5}],4:[function(_dereq_,module,exports){
module.exports = {
  File: _dereq_('./File.coffee'),
  Peer: _dereq_('./Peer.coffee')
};


},{"./File.coffee":2,"./Peer.coffee":3}],5:[function(_dereq_,module,exports){
var uid;

uid = function(n, s) {
  s = (Math.random() * 26 + 10 | 0).toString(36);
  while (--n) {
    s += (Math.random() * 36 | 0).toString(36);
  }
  return s;
};

module.exports = uid;


},{}]},{},[4])
(4)
});