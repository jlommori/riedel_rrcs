var xmlrpc = require('xmlrpc')
var http = require('http').Server()
var net = require('net');
var parseString = require('xml2js').parseString;
var util = require('util');
var chalk = require('chalk');
var io = require('socket.io')(http);

io.on('connection', function(socket){
  console.log(chalk.bgGreen('socket.io a user connected'));
});

http.listen(2509, function(){
  console.log('listening on *:2509');
});

var headers = {
    'content-type': "text/xml",
    'date': "Mon, 17 Jul 1998 19:55:08 GMT",
    'user-agent': "Node RRCS Module"
}

function translateState(c) {
  switch(c) {
    case 0:
      return "unregistered";
      break;
    case 1:
     return "busy";
     break;
    case 2:
      return "active";
      break;
    case 3:
      return "error";
      break;
    default:
      return "undefined";
      break;
  }
}


/**
 * Setup the XML-RPC Listening Server
 *
 * @param  {Obj} host - {ip, port}
 * @param  {Obj} local - {ip, port}
 */
var run = function(host, local, connect) {
  // Creates an XML-RPC server to listen to XML-RPC method calls
  var server = xmlrpc.createServer({ host: local.ip, port: local.port })

  server.on('NotFound', function(method, params) {
    console.log(chalk.red('Method ' + method + ' does not exist'));
  })

  /**
  * GetAlive request from RRCS
  * @event GetAlive
  * @returns {array} callback - [ErrorCode]
  */
  server.on('GetAlive', function (err, params, callback) {
    console.log(chalk.dim("GetAlive called from RRCS"))
    callback(null, ["alive"])
  })

  /**
  * ConnectArtistRestored alert from RRCS
  * @event ConnectArtistRestored
  * @type {object}
  * @property {string} TransKey - Transaction Key ID from RRCS
  * @property {string} GatewayState - Either "Working" or "Standby"
  * @returns {array} callback - [TransKey, ErrorCode]
  * @returns {io.emit} artistStatus - 1 for connected
  */
  server.on('ConnectArtistRestored', function(err, params, callback) {
    console.log(chalk.bgGreen("ConnectArtistRestored called from RRCS"))
    if (params[1] === "Working") {
      callback(null, [params[0], 0])
    }

    io.emit("artistStatus", 1)
  })

  /**
  * ConnectArtistFailure alert from RRCS
  * @event ConnectArtistFailure
  * @type {object}
  * @property {string} TransKey - Transaction Key ID from RRCS
  * @returns {array} callback - [TransKey, ErrorCode]
  * @returns {io.emit} artistStatus - 0 for failure
  */
  server.on('ConnectToArtistFailure', function(err, params, callback) {
    console.log(chalk.bgRed("ConnectArtistFailure called from RRCS"))
    callback(null, [params[0], 0])

    io.emit("artistStatus", 0)
  })

  /**
  * PanelSpyStateChanged alert from RRCS
  * @event PanelSpyStateChanged
  * @type {array}
  * @property {string} TransKey - Transaction Key ID from RRCS
  * @property {array} PanelSpy - [{Node, Port, {Rotate: state}, {Key: state}, {FuncKey: state}, {NumKey: state}}]
  * @returns {array} callback - ["alive"]
  * @returns {io.emt} panelSpy - state
  */
  server.on('PanelSpyStateChanged', function(err, params, callback) {
    var data = params[1][0];
    console.log(chalk.bgGreen("PanelSpyStateChanged called from RRCS for Node: " + data.Node + ", Port: " + data.Port));
    console.log(chalk.cyan("Rotate State: " + translateState(data.Rotate.State)))
    console.log(chalk.cyan("Key State: " + translateState(data.Key.State)))
    console.log(chalk.cyan("FuncKey State: " + translateState(data.FuncKey.State)))
    console.log(chalk.cyan("NumKey State: " + translateState(data.NumKey.State)))
    callback(null, ["alive"])

    io.emit("panelSpy", translateState(data.Rotate.State))
  })

  /**
  * PanelSpyRotateEvent alert from RRCS
  * @event PanelSpyRotateEvent
  * @type {array}
  * @property {string} TransKey - Transaction Key ID from RRCS
  * @property {array} RotateEventData - {Node, Port, SubPanel, KeyNo, RotationTicks, {Shift: bool, Hs: bool, Opt: bool, Beep: bool, Norm: bool}}
  * @returns {array} callback - ["alive"]
  * @returns {io.emit} event - {port, subpanel, key, event, details: {RotationTicks}}
  */
  server.on('PanelSpyRotateEvent', function(err, params, callback) {
    var data = params[1];
    console.log(chalk.bgGreen("PanelSpyRotateEvent called from RRCS for Node: " + data.Node + ", Port: " + data.Port + ", SubPanel: " + data.SubPanel + ", Key: " + data.KeyNo))
    console.log(chalk.cyan("RotationTicks: " + data.RotationTicks))
    console.log(chalk.cyan("FuncKeyStates: Shift: " + data.FuncKeyStates.Shift + " | HS: " + data.FuncKeyStates.Hs + " | Opt: " + data.FuncKeyStates.Opt + " | Beep/F1: " + data.FuncKeyStates.Beep + " | Norm/F2: " + data.FuncKeyStates.Norm))
    callback(null, ["alive"])
    io.emit("event", {
      "port": data.Port,
      "subpanel": data.SubPanel,
      "key": data.KeyNo,
      "event": "rotation",
      "details": {
        "RotationTicks": data.RotationTicks
      }
    })
  })

  /**
  * PanelSpyKeyEvent alert from RRCS
  * @event PanelSpyKeyEvent
  * @type {array}
  * @property {string} TransKey - Transaction Key ID from RRCS
  * @property {array} KeyEventData - {Node, Port, SubPanel, KeyNo, KeyType, IsKeyLatched, KeyAction, {Shift: bool, Hs: bool, Opt: bool, Beep: bool, Norm: bool}}
  * @returns {array} callback - ["alive"]
  * @returns {io.emit} event - {port, subpanel, key, event, details: {KeyAction, KeyType}}
  */
  server.on('PanelSpyKeyEvent', function(err, params, callback) {
    var data = params[1];

    function translateKeyType(k) {
      switch(k) {
        case 0:
          return "Standard/Left"
          break;
        case 1:
          return "Right"
          break;
        case 2:
          return "Rotary"
          break;
      }
    }

    function translateKeyAction(k) {
      switch(k) {
        case 0:
          return "Key Down"
          break;
        case 1:
          return "Key Up"
          break;
      }
    }

    console.log(chalk.bgGreen("PanelSpyKeyEvent called from RRCS for Node: " + data.Node + ", Port: " + data.Port + ", SubPanel: " + data.SubPanel))
    console.log(chalk.cyan("Key " + data.KeyNo + " had a " + translateKeyAction(data.KeyAction) + " action on the " + translateKeyType(data.KeyType) + " key type"))
    console.log(chalk.cyan("FuncKeyStates: Shift: " + data.FuncKeyStates.Shift + " | HS: " + data.FuncKeyStates.Hs + " | Opt: " + data.FuncKeyStates.Opt + " | Beep/F1: " + data.FuncKeyStates.Beep + " | Norm/F2: " + data.FuncKeyStates.Norm))
    callback(null, ["alive"])

    io.emit("event", {
      "port": data.Port,
      "subpanel": data.SubPanel,
      "key": data.KeyNo,
      "event": "key",
      "details": {
        "KeyAction": data.KeyAction,
        "KeyType": data.KeyType
      }
    })

  })


  server.on('CrosspointChange', function(err, params, callback) {
    callback(null, [params[0], 0])
  })

  /**
  * PanelSpyFuncKeyEvent alert from RRCS
  * @event PanelSpyFuncKeyEvent
  * @type {array}
  * @property {string} TransKey - Transaction Key ID from RRCS
  * @property {array} FuncKeyEventData - {Node, Port, FuncKeyNo, FuncKeyAction, {Shift: bool, Hs: bool, Opt: bool, Beep: bool, Norm: bool}}
  * @returns {array} callback - ["alive"]
  * @returns {io.emit} event - {port, subpanel, key, event, details: {KeyAction}}
  */
  server.on('PanelSpyFuncKeyEvent', function(err, params, callback) {
    var data = params[1];
    function translateFuncKeyAction(k) {
      switch(k) {
        case 0:
          return "Key Down"
          break;
        case 1:
          return "Key Up";
          break;
        case 2:
          return "Auto Off"
          break;
      }
    }

    function translateFuncKeyNo(k) {
      switch(k) {
        case 0:
          return "Shift"
          break;
        case 1:
          return "HS"
          break;
        case 2:
          return "Opt"
          break;
        case 3:
          return "Beep/F1"
          break;
        case 4:
          return "Norm/F2"
          break;
      }
    }

    console.log(chalk.bgGreen("PanelSpyFuncKeyEvent called from RRCS for Node: " + data.Node + ", Port: " + data.Port))
    console.log(chalk.cyan(translateFuncKeyNo(data.FuncKeyNo) + " Key had a " + translateFuncKeyAction(data.FuncKeyAction) + " action"))
    console.log(chalk.cyan("FuncKeyStates: Shift: " + data.FuncKeyStates.Shift + " | HS: " + data.FuncKeyStates.Hs + " | Opt: " + data.FuncKeyStates.Opt + " | Beep/F1: " + data.FuncKeyStates.Beep + " | Norm/F2: " + data.FuncKeyStates.Norm))
    callback(null, ["alive"])

    io.emit("event", {
      "port": data.Port,
      "subpanel": data.SubPanel,
      "key": data.FuncKeyNo,
      "event": "funcKey",
      "details": {
        "KeyAction": data.FuncKeyAction,
      }
    })
  })

  console.log('XML-RPC server listening on port 9090')
}




/** @module server */
module.exports = {
  /** run server method */
   run: run
 };
