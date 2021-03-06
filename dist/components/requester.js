'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Configurable = require('./configurable');
var Monitorable = require('./monitorable');
var Component = require('./component');
var axon = require('@dashersw/axon');

module.exports = function (_Monitorable) {
    _inherits(Requester, _Monitorable);

    function Requester(advertisement, discoveryOptions) {
        _classCallCheck(this, Requester);

        var _this = _possibleConstructorReturn(this, (Requester.__proto__ || Object.getPrototypeOf(Requester)).call(this, advertisement, discoveryOptions));

        _this.sock = new axon.types[_this.type]();
        _this.sock.set('retry timeout', 0);
        _this.timeout = advertisement.timeout || process.env.COTE_REQUEST_TIMEOUT;

        _this.startDiscovery();
        return _this;
    }

    _createClass(Requester, [{
        key: 'onAdded',
        value: function onAdded(obj) {
            var _this2 = this;

            _get(Requester.prototype.__proto__ || Object.getPrototypeOf(Requester.prototype), 'onAdded', this).call(this, obj);

            var address = this.constructor.useHostNames ? obj.hostName : obj.address;

            var alreadyConnected = this.sock.socks.some(function (s) {
                return (_this2.constructor.useHostNames ? s._host == obj.hostName : s.remoteAddress == address) && s.remotePort == obj.advertisement.port;
            });

            if (alreadyConnected) return;

            this.sock.connect(obj.advertisement.port, address);
        }
    }, {
        key: 'send',
        value: function send() {
            var _this3 = this;

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var hasCallback = typeof args[args.length - 1] == 'function';
            var timeout = args[0].__timeout || this.timeout;

            if (hasCallback) return sendOverSocket.apply(undefined, [this.sock, timeout].concat(args));

            return new Promise(function (resolve, reject) {
                sendOverSocket.apply(undefined, [_this3.sock, timeout].concat(args, [function (err, res) {
                    if (err) return reject(err);
                    resolve(res);
                }]));
            });
        }
    }, {
        key: 'type',
        get: function get() {
            return 'req';
        }
    }, {
        key: 'oppo',
        get: function get() {
            return 'rep';
        }
    }]);

    return Requester;
}(Monitorable(Configurable(Component)));

function sendOverSocket(sock, timeout) {
    for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
    }

    if (!timeout) return sock.send.apply(sock, args);

    var cb = args.pop();

    var timeoutHandle = setTimeout(function () {
        delete sock.callbacks[messageCallback.id];
        cb(new Error('Request timed out.'));
    }, timeout);

    var messageCallback = function messageCallback() {
        clearTimeout(timeoutHandle);
        cb.apply(undefined, arguments);
    };

    sock.send.apply(sock, args.concat([messageCallback]));
}
//# sourceMappingURL=requester.js.map