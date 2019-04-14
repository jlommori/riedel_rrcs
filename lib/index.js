"use strict";
'use script';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RRCS_Client = exports.RRCS_Server = void 0;

var _homematicXmlrpc = _interopRequireDefault(require("homematic-xmlrpc"));

var _xml2js = require("xml2js");

var _hagen = _interopRequireDefault(require("hagen"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var http = require('http').Server();

var server, ping;
var registeredForAllEvents = false;
/**
 * RRCS_Server Events
 * @param  {obj}   local  {ip: str, port: int}
 * @param  {obj}   remote {ip: str, port: int}
 * @param  {obj} cb     object of callback functions
 */

var RRCS_Server = function RRCS_Server(local, remote, cb) {
  http.listen(local.port);
  server = _homematicXmlrpc["default"].createServer({
    host: local.ip,
    port: local.port
  });
  cb.log("RRCS Server listening on ".concat(local.port));

  var client = _homematicXmlrpc["default"].createClient({
    host: remote.ip,
    port: remote.port,
    headers: {
      'Content-Type': "text/xml",
      'Date': "Mon, 17 Jul 1998 19:55:08 GMT",
      'User-Agent': "Node RRCS Server Module"
    }
  });

  client.methodCall('RegisterForAllEvents', ['C0000000001', local.port, "/", true, false], function (err, val) {
    _hagen["default"].log('RRCS_Client', 'RegisterForAllEvents called'); // cb.registerForAllEvents(val, err)

  });
  server.on('NotFound', function (method, params, callback) {
    cb.notFound("".concat(method, " not found"), params);
  });
  /**
  * getAlive Ping request from RRCS
  * @event GetAlive
  */

  server.on('GetAlive', function (err, params, callback) {
    cb.getAlive();
    callback(null, ["alive"]);
  });
  /**
   * crosspointChange notification
   * @event CrosspointChange
   * @return {array} params: [TransKey: str, XP_count: int, XPs: {"XP#x": [src.net, src.node, src.port, dest.net, dest.node, dest.port, active]}]
   */

  server.on('CrosspointChange', function (err, params, callback) {
    if (err) cb.error('crosspointChange error', err);else cb.crosspointChange(params);
    callback(null, params[0]);
  });
  /**
   * sendString notification
   * @event SendString
   * @return {array} params: [TransKey: str, string: str]
   */

  server.on('SendString', function (err, params, callback) {
    if (err) cb.error('sendString error', err);else cb.sendString(params);
    callback(null, params[0]);
  });
  /**
   * sendString notification
   * @event SendStringOff
   * @return {array} params: [TransKey: str, string: str]
   */

  server.on('SendStringOff', function (err, params, callback) {
    if (err) cb.error('sendStringOff error', err);else cb.sendStringOff(params);
    callback(null, params[0]);
  });
  /**
   * gpInputChange notification
   * @event gpInputChange
   * @return {array} params: [TransKey: str, net: int, node: int, port: int, slot: int, gpio: int, state: bool]
   */

  server.on('GpInputChange', function (err, params, callback) {
    if (err) cb.error('sendStringOff error', err);else cb.gpInputChange(params);
    callback(null, params[0]);
  });
  /**
   * logicSourceChange notification
   * @event LogicSourceChange
   * @return {array} params: [TransKey: str, Object ID: int, state: bool]
   */

  server.on('LogicSourceChange', function (err, params, callback) {
    if (err) cb.error('logicSourceChange error', err);else cb.logicSourceChange(params);
    callback(null, params[0]);
  });
  /**
   * configuratoinChange notification
   * @event ConfigurationChange
   */

  server.on('ConfigurationChange', function (err, params, callback) {
    if (err) cb.error('configurationChange error', err);else cb.configurationChange('configurationChange');
  });
  /**
   * upstreamFailed notification
   * @event UpstreamFailed
   * @return {array} params: [TransKey: str, Net: int, Node: int]
   */

  server.on('UpstreamFailed', function (err, params, callback) {
    if (err) cb.error('upstreamFailed error', err);else cb.upstreamFailed('upstreamFailed', params);
    callback(null, params[0]);
  });
  /**
   * upstreamFailedCleared notification
   * @event UpstreamFailedCleared
   * @return {array} params: [TransKey: str, Net: int, Node: int]
   */

  server.on('UpstreamFailedCleared', function (err, params, callback) {
    if (err) cb.error('upstreamFailedCleared error', err);else cb.upstreamFailedCleared('upstreamFailedCleared', params);
    callback(null, params[0]);
  });
  /**
   * downstreamFailed notification
   * @event DownstreamFailed
   * @return {array} params: [TransKey: str, Net: int, Node: int]
   */

  server.on('DownstreamFailed', function (err, params, callback) {
    if (err) cb.error('downstreamFailed error', err);else cb.downstreamFailed('downstreamFailed', params);
    callback(null, params[0]);
  });
  /**
   * downstreamFailedCleared notification
   * @event DownstreamFailedCleared
   * @return {array} params: [TransKey: str, Net: int, Node: int]
   */

  server.on('DownstreamFailedCleared', function (err, params, callback) {
    if (err) cb.error('downstreamFailedCleared error', err);else cb.downstreamFailedCleared('downstreamFailedCleared', params);
    callback(null, params[0]);
  });
  /**
   * nodeControllerFailed notification
   * @event NodeControllerFailed
   * @return {array} params: [TransKey: str, Net: int, Node: int]
   */

  server.on('NodeControllerFailed', function (err, params, callback) {
    if (err) cb.error('nodeControllerFailed error', err);else cb.nodeControllerFailed('nodeControllerFailed', params);
    callback(null, params[0]);
  });
  /**
   * nodeControllerReboot notification
   * @event NodeControllerReboot
   * @return {array} params: [TransKey: str, Net: int, Node: int]
   */

  server.on('NodeControllerReboot', function (err, params, callback) {
    if (err) cb.error('nodeControllerReboot error', err);else cb.nodeControllerReboot('nodeControllerReboot', params);
    callback(null, params[0]);
  });
  /**
   * clientFailed notification
   * @event ClientFailed
   * @return {array} params: [TransKey: str, Net: int, Node: int, slot: Int]
   */

  server.on('ClientFailed', function (err, params, callback) {
    if (err) cb.error('clientFailed error', err);else cb.clientFailed('clientFailed', params);
    callback(null, params[0]);
  });
  /**
   * clientFailedCleared notification
   * @event ClientFailedCleared
   * @return {array} params: [TransKey: str, Net: int, Node: int, slot: Int]
   */

  server.on('ClientFailedCleared', function (err, params, callback) {
    if (err) cb.error('clientFailedCleared error', err);else cb.clientFailedCleared('clientFailedCleared', params);
    callback(null, params[0]);
  });
  /**
   * portInactive notification
   * @event PortInactive
   * @return {array} params: [TransKey: str, Net: int, Node: int, port: Int]
   */

  server.on('PortInactive', function (err, params, callback) {
    if (err) cb.error('portInactive error', err);else cb.portInactive('portInactive', params);
    callback(null, params[0]);
  });
  /**
   * portActive notification
   * @event PortActive
   * @return {array} params: [TransKey: str, Net: int, Node: int, port: Int]
   */

  server.on('PortActive', function (err, params, callback) {
    if (err) cb.error('portActive error', err);else cb.portActive('portActive', params);
    callback(null, params[0]);
  });
  /**
   * connectArtistRestored notification
   * @event ConnectArtistRestored
   * @return {array} params: [TransKey: str, GatewayState: str]
   */

  server.on('ConnectArtistRestored', function (err, params, callback) {
    if (err) cb.error('conectArtistRestored', err);
    cb.connectArtistRestored("connectArtistRestored", params);
    callback(null, params[0]);
  });
  /**
   * connectArtistFailed notification
   * @event ConnectArtistFailed
   * @return {array} params: [TransKey: str, GatewayState: str]
   */

  server.on('ConnectArtistFailed', function (err, params, callback) {
    if (err) cb.error('conectArtistFailed', err);
    cb.connectArtistFailed("connectArtistFailed", params);
    callback(null, params[0]);
  });
  /**
   * gatewayShutdown notification
   * @event GatewayShutdown
   */

  server.on('GatewayShutdown', function (err, params, callback) {
    if (err) cb.error('gatewayShutdown', err);
    cb.gatewayShutdown("gatewayShutdown", params);
    callback(null, params[0]);
  });
};

exports.RRCS_Server = RRCS_Server;

/**
 * standardCallback
 *
 * @callback
 * @param  {Obj} error - error returned from RRCS
 * @param  {Obj} value - valid response returned from RRCS
 * @return {Obj} status - {status, value}
 */
function standardCallback(error, value, method) {
  if (error !== null) {
    _hagen["default"].error('RRCS Error: ', method + " | " + error.faultString);

    var r = {
      "status": "error",
      "value": error
    };
    return r;
  } else {
    _hagen["default"].log('RRCS Response', method);

    console.log(value);
    var r = {
      "status": "success",
      "value": value
    };
    return r;
  }
}
/**
 * Generic RRCS request
 * @param  {object} client xml-rpc client connection
 * @param  {string} name   xml-rpc request name
 * @param  {array} params array of parameters for this request ['TransKey', ...]
 * @param  {function} cb callback
 * @return {promise}  resolve: {val}, reject: {err}
 */


function clientRequest(client, name, params, cb) {
  return new Promise(function (res, rej) {
    client.methodCall(name, params, function (err, val) {
      _hagen["default"].log('RRCS_Client', "".concat(name, " called"));

      if (err) rej(cb({
        err: err
      }));else res(cb({
        val: val
      }));
    });
  });
}
/** Class for making requests to RRCS. */


var RRCS_Client =
/*#__PURE__*/
function () {
  /**
   * Setup connectivity to RRCS
   * @param {string} host [RRCS IP Address]
   * @param {int} port [RRCS port number]
   */
  function RRCS_Client(host, port) {
    _classCallCheck(this, RRCS_Client);

    this.host = host;
    this.port = port;
    this.headers = {
      'content-type': "text/xml",
      'date': "Mon, 17 Jul 1998 19:55:08 GMT",
      'user-agent': "Node RRCS Client Module"
    };
    this.client = _homematicXmlrpc["default"].createClient({
      host: this.host,
      port: this.port,
      headers: this.headers
    });
  } // ---------- Ports & XPs ---------- //

  /**
   * @callback getVersionCb
   * @param     {string}  TransKey - Transaction Key
   * @param     {string}  version - RRCS Version Number
   */

  /**
   * Get current version of RRCS
   * @return {getVersionCb}
   */


  _createClass(RRCS_Client, [{
    key: "getVersion",
    value: function () {
      var _getVersion = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var _this = this;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  _this.client.methodCall('GetVersion', ['C0123456789'], function (err, val) {
                    if (err) reject(err);
                    resolve({
                      TransKey: val[0],
                      version: val[2]
                    });
                  });
                }));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function getVersion() {
        return _getVersion.apply(this, arguments);
      }

      return getVersion;
    }()
    /**
     * @callback getStateCb
     * @param     {string}  TransKey - Transaction Key
     * @param     {string}  state - ['working', 'standby']
     */

    /**
     * Get current state of RRCS
     * @return {getStateCb}
     */

  }, {
    key: "getState",
    value: function () {
      var _getState = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        var _this2 = this;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", new Promise(function (resolve, reject) {
                  _this2.client.methodCall('GetState', ['C0123456789'], function (err, val) {
                    if (err) reject(err);
                    resolve({
                      TransKey: val[0],
                      state: val[2]
                    });
                  });
                }));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function getState() {
        return _getState.apply(this, arguments);
      }

      return getState;
    }()
    /**
     * @callback isConnectedToArtistCb
     * @param     {string}  TransKey - Transaction Key
     * @param     {boolean}  isConnected - RRCS is currently connected to Artist
     */

    /**
     * Check if RRCS is connected to Artist
     * @return {isConnectedToArtistCb}
     */

  }, {
    key: "isConnectedToArtist",
    value: function () {
      var _isConnectedToArtist = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3() {
        var _this3 = this;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", new Promise(function (resolve, reject) {
                  _this3.client.methodCall('IsConnectedToArtist', ['C0123456789'], function (err, val) {
                    if (err) reject(err);
                    resolve({
                      TransKey: val.TransKey,
                      isConnected: val.IsConnected
                    });
                  });
                }));

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function isConnectedToArtist() {
        return _isConnectedToArtist.apply(this, arguments);
      }

      return isConnectedToArtist;
    }() // ---------- Ports & XPs ---------- //

    /**
     * @callback getObjectsCb
     * @param     {string}  TransKey - Transaction Key
     * @param     {array}   ports - {LongName, ObjectID}
     * @param     {array}   conferences - {LongName, ObjectID}
     * @param     {array}   groups - {LongName, ObjectID}
     * @param     {array}   ifbs - {LongName, ObjectID}
     * @param     {object}  logic - {srcs: [{LongName, ObjectID}], dests: [{LongName, ObjectID}]}
     * @param     {object}  gpio - {inputs: [{LongName, ObjectID}], outputs: [{LongName, ObjectID}]}
     * @param     {array}   users - {LongName, ObjectID}
     * @param     {array}   audiopatches - {LongName, ObjectID}
     * @param     {array}   clientCards - {ObjectID}
     */

    /**
     * Get all configured objects from the Artist System
     * @return {getObjectsCb}
     */

  }, {
    key: "getObjects",
    value: function () {
      var _getObjects = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5() {
        var _this4 = this;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                return _context5.abrupt("return", new Promise(
                /*#__PURE__*/
                function () {
                  var _ref = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee4(resolve, reject) {
                    var objects;
                    return regeneratorRuntime.wrap(function _callee4$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            objects = {
                              logic: {},
                              gpio: {}
                            };
                            _context4.next = 3;
                            return clientRequest(_this4.client, 'GetObjectList', ['C0123456789', 'port'], function (res) {
                              if (res.err) reject(err);
                              objects.ports = res.val.ObjectList;
                            });

                          case 3:
                            _context4.next = 5;
                            return clientRequest(_this4.client, 'GetObjectList', ['C0123456789', 'conference'], function (res) {
                              if (res.err) reject(err);
                              objects.conferences = res.val.ObjectList;
                            });

                          case 5:
                            _context4.next = 7;
                            return clientRequest(_this4.client, 'GetObjectList', ['C0123456789', 'group'], function (res) {
                              if (res.err) reject(err);else objects.groups = res.val.ObjectList;
                            });

                          case 7:
                            _context4.next = 9;
                            return clientRequest(_this4.client, 'GetObjectList', ['C0123456789', 'ifb'], function (res) {
                              if (res.err) reject(err);
                              objects.ifbs = res.val.ObjectList;
                            });

                          case 9:
                            _context4.next = 11;
                            return clientRequest(_this4.client, 'GetObjectList', ['C0123456789', 'logic-source'], function (res) {
                              if (res.err) reject(err);
                              objects.logic.srcs = res.val.ObjectList;
                            });

                          case 11:
                            _context4.next = 13;
                            return clientRequest(_this4.client, 'GetObjectList', ['C0123456789', 'logic-destination'], function (res) {
                              if (res.err) reject(err);
                              objects.logic.dests = res.val.ObjectList;
                            });

                          case 13:
                            _context4.next = 15;
                            return clientRequest(_this4.client, 'GetObjectList', ['C0123456789', 'gp-input'], function (res) {
                              if (res.err) reject(err);
                              objects.gpio.inputs = res.val.ObjectList;
                            });

                          case 15:
                            _context4.next = 17;
                            return clientRequest(_this4.client, 'GetObjectList', ['C0123456789', 'gp-output'], function (res) {
                              if (res.err) reject(err);
                              objects.gpio.outputs = res.val.ObjectList;
                            });

                          case 17:
                            _context4.next = 19;
                            return clientRequest(_this4.client, 'GetObjectList', ['C0123456789', 'user'], function (res) {
                              if (res.err) reject(err);
                              objects.users = res.val.ObjectList;
                            });

                          case 19:
                            _context4.next = 21;
                            return clientRequest(_this4.client, 'GetObjectList', ['C0123456789', 'audiopatch'], function (res) {
                              if (res.err) reject(err);
                              objects.audiopatches = res.val.ObjectList;
                            });

                          case 21:
                            _context4.next = 23;
                            return clientRequest(_this4.client, 'GetObjectList', ['C0123456789', 'client-card'], function (res) {
                              if (res.err) reject(err);
                              objects.clientCards = res.val.ObjectList;
                            });

                          case 23:
                            resolve(objects);

                          case 24:
                          case "end":
                            return _context4.stop();
                        }
                      }
                    }, _callee4);
                  }));

                  return function (_x, _x2) {
                    return _ref.apply(this, arguments);
                  };
                }()));

              case 1:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function getObjects() {
        return _getObjects.apply(this, arguments);
      }

      return getObjects;
    }()
    /**
     * Get all ports in the system
     * @param  {int} id - ObjectID
     * @return {array}   {Input: bool, KeyCount: int, Label: str, Name: str, Node: int, ObjectID: int, Output: bool, PageCount: int, Port: int, PortType: str}
     */

  }, {
    key: "getAllPorts",
    value: function () {
      var _getAllPorts = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6() {
        var _this5 = this;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                return _context6.abrupt("return", new Promise(function (resolve, reject) {
                  _this5.client.methodCall('GetAllPorts', ['C0123456789'], function (err, val) {
                    if (err) reject(err);
                    resolve(val[1]);
                  });
                }));

              case 1:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function getAllPorts() {
        return _getAllPorts.apply(this, arguments);
      }

      return getAllPorts;
    }()
    /**
     * Get all properties from a particular object
     * @param  {int} id - ObjectID
     * @return {object}   properites - Properites object varies depending on object type
     */

  }, {
    key: "getObjectProperties",
    value: function () {
      var _getObjectProperties = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7(id) {
        var _this6 = this;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                return _context7.abrupt("return", new Promise(function (resolve, reject) {
                  _this6.client.methodCall('GetObjectProperty', ['C0123456789', id, ''], function (err, val) {
                    if (err) reject(err);
                    resolve(val);
                  });
                }));

              case 1:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function getObjectProperties(_x3) {
        return _getObjectProperties.apply(this, arguments);
      }

      return getObjectProperties;
    }()
    /**
     * Get all properties from a particular object
     * @return {object} {TransKey, XP Count: XPs in this obj, XP#n...: [srcNet, srcNode, srcPort, destNet, destNode, destPort]}
     */

  }, {
    key: "getAllActiveXps",
    value: function () {
      var _getAllActiveXps = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8() {
        var _this7 = this;

        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                return _context8.abrupt("return", new Promise(function (resolve, reject) {
                  _this7.client.methodCall('GetAllActiveXps', ['C0123456789'], function (err, val) {
                    if (err) reject(err);
                    resolve(val);
                  });
                }));

              case 1:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }));

      function getAllActiveXps() {
        return _getAllActiveXps.apply(this, arguments);
      }

      return getAllActiveXps;
    }()
    /**
     * @callback getXpStatusCb
     * @param     {string}  TransKey - Transaction Key
     * @param     {boolean}  xpActive - State of XP
     */

    /**
     * Get a specific XP Status
     * @param  {object}   src - source port object: {net, node, port}
     * @param  {object}   dest - destination port object: {net, node, port}
     * @return {getXpStatusCb}
     * @memberof Ports&XPs
     */

  }, {
    key: "getXpStatus",
    value: function () {
      var _getXpStatus = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9(src, dest) {
        var _this8 = this;

        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                return _context9.abrupt("return", new Promise(function (resolve, reject) {
                  _this8.client.methodCall('GetXpStatus', ['C0123456789', src.net, src.node, src.port, dest.net, dest.node, dest.port], function (err, val) {
                    if (err) reject(err);
                    resolve({
                      TransKey: val[0],
                      xpActive: val[2]
                    });
                  });
                }));

              case 1:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9);
      }));

      function getXpStatus(_x4, _x5) {
        return _getXpStatus.apply(this, arguments);
      }

      return getXpStatus;
    }()
    /**
     * @callback getXpVolumeCb
     * @param     {string}  TransKey - Transaction Key
     * @param     {int}  singleVolume - Volume for a point to point XP
     * @param     {int}  confVolume - Volume for a conference XP
     */

    /**
     * Get a specific XP Volume
     * @param  {object}   src - source port object: {net, node, port}
     * @param  {object}   dest - destination port object: {net, node, port}
     * @return {getXpVolumeCb}
     */

  }, {
    key: "getXpVolume",
    value: function () {
      var _getXpVolume = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee10(src, dest) {
        var _this9 = this;

        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                return _context10.abrupt("return", new Promise(function (resolve, reject) {
                  _this9.client.methodCall('GetXpVolume', ['C0123456789', src.net, src.node, src.port, dest.net, dest.node, dest.port], function (err, val) {
                    if (err) reject(err);
                    resolve({
                      TransKey: val[0],
                      singleVolume: val[2],
                      confVolume: val[3]
                    });
                  });
                }));

              case 1:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10);
      }));

      function getXpVolume(_x6, _x7) {
        return _getXpVolume.apply(this, arguments);
      }

      return getXpVolume;
    }()
    /**
     * @callback getInputGainCb
     * @param     {string}  TransKey - Transaction Key
     * @param     {int}  gain - Input Gain
     */

    /**
     * Get input gain of a port
     * @param  {object}   src - source port object: {net, node, port}
     * @return {getInputGainCb}
     */

  }, {
    key: "getInputGain",
    value: function () {
      var _getInputGain = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee11(src) {
        var _this10 = this;

        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                return _context11.abrupt("return", new Promise(function (resolve, reject) {
                  _this10.client.methodCall('GetInputGain', ['C0123456789', src.net, src.node, src.port], function (err, val) {
                    if (err) reject(err);
                    resolve({
                      TransKey: val[0],
                      gain: val[2]
                    });
                  });
                }));

              case 1:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11);
      }));

      function getInputGain(_x8) {
        return _getInputGain.apply(this, arguments);
      }

      return getInputGain;
    }()
    /**
     * @callback getOutputGainCb
     * @param     {string}  TransKey - Transaction Key
     * @param     {int}  gain - Input Gain
     */

    /**
     * Get output gain of a port
     * @param  {object}   src - source port object: {net, node, port}
     * @return {getInputGainCb}
     */

  }, {
    key: "getOutputGain",
    value: function () {
      var _getOutputGain = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee12(src) {
        var _this11 = this;

        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                return _context12.abrupt("return", new Promise(function (resolve, reject) {
                  _this11.client.methodCall('GetOutputGain', ['C0123456789', src.net, src.node, src.port], function (err, val) {
                    if (err) reject(err);
                    resolve({
                      TransKey: val[0],
                      gain: val[2]
                    });
                  });
                }));

              case 1:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12);
      }));

      function getOutputGain(_x9) {
        return _getOutputGain.apply(this, arguments);
      }

      return getOutputGain;
    }()
    /**
     * @callback getGPInputStateCb
     * @param     {string}  TransKey - Transaction Key
     * @param     {bool}  state - Input Gain
     */

    /**
     * Get GP input state
     * @param  {object}   src - source port object: {net, node, port, gpio}
     * @return {getGPInputStateCb}
     */

  }, {
    key: "getGPInputStatus",
    value: function () {
      var _getGPInputStatus = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee13(src) {
        var _this12 = this;

        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                return _context13.abrupt("return", new Promise(function (resolve, reject) {
                  _this12.client.methodCall('GetGpInputStatus', ['C0123456789', src.net, src.node, src.port, src.gpio], function (err, val) {
                    if (err) reject(err);
                    resolve({
                      TransKey: val[0],
                      status: val[2]
                    });
                  });
                }));

              case 1:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13);
      }));

      function getGPInputStatus(_x10) {
        return _getGPInputStatus.apply(this, arguments);
      }

      return getGPInputStatus;
    }()
    /**
     * @callback getGPOutputStateCb
     * @param     {string}  TransKey - Transaction Key
     * @param     {bool}  state - Input Gain
     */

    /**
     * Get GP output state
     * @param  {object}   src - source port object: {net, node, port, gpio}
     * @return {getGPOutputStateCb}
     */

  }, {
    key: "getGPOutputStatus",
    value: function () {
      var _getGPOutputStatus = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee14(src) {
        var _this13 = this;

        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                return _context14.abrupt("return", new Promise(function (resolve, reject) {
                  _this13.client.methodCall('GetGpOutputStatus', ['C0123456789', src.net, src.node, src.port, src.gpio], function (err, val) {
                    if (err) reject(err);
                    resolve({
                      TransKey: val[0],
                      status: val[2]
                    });
                  });
                }));

              case 1:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14);
      }));

      function getGPOutputStatus(_x11) {
        return _getGPOutputStatus.apply(this, arguments);
      }

      return getGPOutputStatus;
    }()
    /**
     * Get Logic Sources
     * @return {object} {TransKey: int, ErrorCode: int, LogicSourceCount: int, LogicSource#x: [longName, label, Id, state]}
     */

  }, {
    key: "getLogicSources",
    value: function () {
      var _getLogicSources = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee15() {
        var _this14 = this;

        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                return _context15.abrupt("return", new Promise(function (resolve, reject) {
                  _this14.client.methodCall('GetAllLogicSources_v2', ['C0123456789'], function (err, val) {
                    if (err) reject(err);
                    resolve(val);
                  });
                }));

              case 1:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15);
      }));

      function getLogicSources() {
        return _getLogicSources.apply(this, arguments);
      }

      return getLogicSources;
    }()
    /**
     * Get all IFBs
     * @param  {int} id - ObjectID
     * @return {array}   { Input: { IsInput: bool, Node: int, Port: int }, Label: str, LongName: str, MixMinus: { IsInput: bool, Node: int, Port: int }, Number: int, ObjectID: int, Output: { IsInput: bool, Node: int, Port: int }, Owner: int }
     */

  }, {
    key: "getAllIFBs",
    value: function () {
      var _getAllIFBs = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee16() {
        var _this15 = this;

        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                return _context16.abrupt("return", new Promise(function (resolve, reject) {
                  _this15.client.methodCall('GetAllIFBs', ['C0123456789'], function (err, val) {
                    if (err) reject(err);
                    resolve(val[1]);
                  });
                }));

              case 1:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16);
      }));

      function getAllIFBs() {
        return _getAllIFBs.apply(this, arguments);
      }

      return getAllIFBs;
    }()
    /**
     * Get All Active Port Clones
     * @return {array}
     */

  }, {
    key: "getAllActivePortClones",
    value: function () {
      var _getAllActivePortClones = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee17() {
        var _this16 = this;

        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                return _context17.abrupt("return", new Promise(function (resolve, reject) {
                  _this16.client.methodCall('GetAllActivePortClones', ['C0123456789'], function (err, val) {
                    if (err) reject(err);
                    resolve(val[1]);
                  });
                }));

              case 1:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17);
      }));

      function getAllActivePortClones() {
        return _getAllActivePortClones.apply(this, arguments);
      }

      return getAllActivePortClones;
    }()
    /**
     * Get all trunk ports
     * @return {array}
     */

  }, {
    key: "getAllTrunkPorts",
    value: function () {
      var _getAllTrunkPorts = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee18() {
        var _this17 = this;

        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                return _context18.abrupt("return", new Promise(function (resolve, reject) {
                  _this17.client.methodCall('GetTrunkPorts', ['C0123456789'], function (err, val) {
                    if (err) reject(err);
                    resolve(val);
                  });
                }));

              case 1:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18);
      }));

      function getAllTrunkPorts() {
        return _getAllTrunkPorts.apply(this, arguments);
      }

      return getAllTrunkPorts;
    }()
    /**
     * Get trunk line setup
     * @return {array} {DestNetName: str, DestNetTrAddr: int, DestPortName: str, DestTrAddr: int, SrcNetName: str, SrcNetTrAddr: int, SrcPortName: str, SrcPortTrAddr: int}
     */

  }, {
    key: "getTrunklineSetup",
    value: function () {
      var _getTrunklineSetup = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee19() {
        var _this18 = this;

        return regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                return _context19.abrupt("return", new Promise(function (resolve, reject) {
                  _this18.client.methodCall('GetTrunklineSetup', ['C0123456789'], function (err, val) {
                    if (err) reject(err);
                    resolve(val[2]);
                  });
                }));

              case 1:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19);
      }));

      function getTrunklineSetup() {
        return _getTrunklineSetup.apply(this, arguments);
      }

      return getTrunklineSetup;
    }()
    /**
     * Get trunk line activity
     * @return {array} { DestTrAddr: { DestObjAddr: int, NetTrAddr: int }, Priority: int, SrcTrAddr: { NetTrAddr: int, SrcObjAddr: int }, TrunkCmdType: int, TrunklinePath: [ { dNetTrAddr: int, dPortTrAddr: int, sNetTrAddr: int, sPortTrAddr: int }, { dNetTrAddr: int, dPortTrAddr: int, sNetTrAddr: int, sPortTrAddr: int } ] }
     */

  }, {
    key: "getTrunklineActivity",
    value: function () {
      var _getTrunklineActivity = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee20() {
        var _this19 = this;

        return regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                return _context20.abrupt("return", new Promise(function (resolve, reject) {
                  _this19.client.methodCall('GetTrunklineActivities', ['C0123456789'], function (err, val) {
                    if (err) reject(err);
                    resolve(val[2]);
                  });
                }));

              case 1:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee20);
      }));

      function getTrunklineActivity() {
        return _getTrunklineActivity.apply(this, arguments);
      }

      return getTrunklineActivity;
    }()
  }]);

  return RRCS_Client;
}();

exports.RRCS_Client = RRCS_Client;
