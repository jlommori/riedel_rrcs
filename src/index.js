'use script'
import xmlrpc from 'homematic-xmlrpc'
import { parseString } from 'xml2js'
import hagen from 'hagen'
const http = require('http').Server()

let server, ping
let registeredForAllEvents = false

/**
 * RRCS_Server Events
 * @param  {obj}   local  {ip: str, port: int}
 * @param  {obj}   remote {ip: str, port: int}
 * @param  {obj} cb     object of callback functions
 */
let RRCS_Server = function (local, remote, cb) {
  http.listen(local.port)

  server = xmlrpc.createServer({host: local.ip, port: local.port})
  cb.log(`RRCS Server listening on ${local.port}`)

  let client = xmlrpc.createClient({
    host: remote.ip,
    port: remote.port,
    headers: {
        'Content-Type': "text/xml",
        'Date': "Mon, 17 Jul 1998 19:55:08 GMT",
        'User-Agent': "Node RRCS Server Module"
      }
    })

  client.methodCall('RegisterForAllEvents',
    ['C0000000001', local.port, "/", true, false], (err, val) => {
      hagen.log('RRCS_Client', 'RegisterForAllEvents called')
      // cb.registerForAllEvents(val, err)
  })

  server.on('NotFound', function(method, params, callback) {
    cb.notFound(`${method} not found`, params);
  })

  /**
  * getAlive Ping request from RRCS
  * @event GetAlive
  */
  server.on('GetAlive', function (err, params, callback) {
    cb.getAlive()
    callback(null, ["alive"])
  })

  /**
   * crosspointChange notification
   * @event CrosspointChange
   * @return {array} params: [TransKey: str, XP_count: int, XPs: {"XP#x": [src.net, src.node, src.port, dest.net, dest.node, dest.port, active]}]
   */
  server.on('CrosspointChange', (err, params, callback) => {
    if (err) cb.error('crosspointChange error', err)
    else cb.crosspointChange(params)
    callback(null, params[0])
  })

  /**
   * sendString notification
   * @event SendString
   * @return {array} params: [TransKey: str, string: str]
   */
  server.on('SendString', (err, params, callback) => {
    if (err) cb.error('sendString error', err)
    else cb.sendString(params)
    callback(null, params[0])
  })

  /**
   * sendString notification
   * @event SendStringOff
   * @return {array} params: [TransKey: str, string: str]
   */
  server.on('SendStringOff', (err, params, callback) => {
    if (err) cb.error('sendStringOff error', err)
    else cb.sendStringOff(params)
    callback(null, params[0])
  })

  /**
   * gpInputChange notification
   * @event gpInputChange
   * @return {array} params: [TransKey: str, net: int, node: int, port: int, slot: int, gpio: int, state: bool]
   */
  server.on('GpInputChange', (err, params, callback) => {
    if (err) cb.error('sendStringOff error', err)
    else cb.gpInputChange(params)
    callback(null, params[0])
  })

  /**
   * logicSourceChange notification
   * @event LogicSourceChange
   * @return {array} params: [TransKey: str, Object ID: int, state: bool]
   */
  server.on('LogicSourceChange', (err, params, callback) => {
    if (err) cb.error('logicSourceChange error', err)
    else cb.logicSourceChange(params)
    callback(null, params[0])
  })

  /**
   * configuratoinChange notification
   * @event ConfigurationChange
   */
  server.on('ConfigurationChange', (err, params, callback) => {
    if (err) cb.error('configurationChange error', err)
    else cb.configurationChange('configurationChange')
  })

  /**
   * upstreamFailed notification
   * @event UpstreamFailed
   * @return {array} params: [TransKey: str, Net: int, Node: int]
   */
  server.on('UpstreamFailed', (err, params, callback) => {
    if (err) cb.error('upstreamFailed error', err)
    else cb.upstreamFailed('upstreamFailed', params)
    callback(null, params[0])
  })

  /**
   * upstreamFailedCleared notification
   * @event UpstreamFailedCleared
   * @return {array} params: [TransKey: str, Net: int, Node: int]
   */
  server.on('UpstreamFailedCleared', (err, params, callback) => {
    if (err) cb.error('upstreamFailedCleared error', err)
    else cb.upstreamFailedCleared('upstreamFailedCleared', params)
    callback(null, params[0])
  })

  /**
   * downstreamFailed notification
   * @event DownstreamFailed
   * @return {array} params: [TransKey: str, Net: int, Node: int]
   */
  server.on('DownstreamFailed', (err, params, callback) => {
    if (err) cb.error('downstreamFailed error', err)
    else cb.downstreamFailed('downstreamFailed', params)
    callback(null, params[0])
  })

  /**
   * downstreamFailedCleared notification
   * @event DownstreamFailedCleared
   * @return {array} params: [TransKey: str, Net: int, Node: int]
   */
  server.on('DownstreamFailedCleared', (err, params, callback) => {
    if (err) cb.error('downstreamFailedCleared error', err)
    else cb.downstreamFailedCleared('downstreamFailedCleared', params)
    callback(null, params[0])
  })

  /**
   * nodeControllerFailed notification
   * @event NodeControllerFailed
   * @return {array} params: [TransKey: str, Net: int, Node: int]
   */
  server.on('NodeControllerFailed', (err, params, callback) => {
    if (err) cb.error('nodeControllerFailed error', err)
    else cb.nodeControllerFailed('nodeControllerFailed', params)
    callback(null, params[0])
  })

  /**
   * nodeControllerReboot notification
   * @event NodeControllerReboot
   * @return {array} params: [TransKey: str, Net: int, Node: int]
   */
  server.on('NodeControllerReboot', (err, params, callback) => {
    if (err) cb.error('nodeControllerReboot error', err)
    else cb.nodeControllerReboot('nodeControllerReboot', params)
    callback(null, params[0])
  })

  /**
   * clientFailed notification
   * @event ClientFailed
   * @return {array} params: [TransKey: str, Net: int, Node: int, slot: Int]
   */
  server.on('ClientFailed', (err, params, callback) => {
    if (err) cb.error('clientFailed error', err)
    else cb.clientFailed('clientFailed', params)
    callback(null, params[0])
  })

  /**
   * clientFailedCleared notification
   * @event ClientFailedCleared
   * @return {array} params: [TransKey: str, Net: int, Node: int, slot: Int]
   */
  server.on('ClientFailedCleared', (err, params, callback) => {
    if (err) cb.error('clientFailedCleared error', err)
    else cb.clientFailedCleared('clientFailedCleared', params)
    callback(null, params[0])
  })

  /**
   * portInactive notification
   * @event PortInactive
   * @return {array} params: [TransKey: str, Net: int, Node: int, port: Int]
   */
  server.on('PortInactive', (err, params, callback) => {
    if (err) cb.error('portInactive error', err)
    else cb.portInactive('portInactive', params)
    callback(null, params[0])
  })

  /**
   * portActive notification
   * @event PortActive
   * @return {array} params: [TransKey: str, Net: int, Node: int, port: Int]
   */
  server.on('PortActive', (err, params, callback) => {
    if (err) cb.error('portActive error', err)
    else cb.portActive('portActive', params)
    callback(null, params[0])
  })

  /**
   * connectArtistRestored notification
   * @event ConnectArtistRestored
   * @return {array} params: [TransKey: str, GatewayState: str]
   */
  server.on('ConnectArtistRestored', (err, params, callback) => {
    if (err) cb.error('conectArtistRestored', err)
    cb.connectArtistRestored(`connectArtistRestored`, params);
    callback(null, params[0])
  })

  /**
   * connectArtistFailed notification
   * @event ConnectArtistFailed
   * @return {array} params: [TransKey: str, GatewayState: str]
   */
  server.on('ConnectArtistFailed', (err, params, callback) => {
    if (err) cb.error('conectArtistFailed', err)
    cb.connectArtistFailed(`connectArtistFailed`, params);
    callback(null, params[0])
  })

  /**
   * gatewayShutdown notification
   * @event GatewayShutdown
   */
  server.on('GatewayShutdown', (err, params, callback) => {
    if (err) cb.error('gatewayShutdown', err)
    cb.gatewayShutdown(`gatewayShutdown`, params);
    callback(null, params[0])
  })
}

export { RRCS_Server }


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
    hagen.error('RRCS Error: ', method + " | " + error.faultString)
    var r = {
      "status": "error",
      "value": error
    }
    return r
  } else {
    hagen.log('RRCS Response', method)
    console.log(value)
    var r = {
      "status": "success",
      "value": value
    }
    return r
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
  return new Promise((res, rej) => {
    client.methodCall(name, params, (err, val) => {
      hagen.log('RRCS_Client', `${name} called`)
      if (err) rej(cb({err: err}))
      else res(cb({val: val}))
    })
  })
}

/** Class for making requests to RRCS. */
class RRCS_Client {
  /**
   * Setup connectivity to RRCS
   * @param {string} host [RRCS IP Address]
   * @param {int} port [RRCS port number]
   */
  constructor(host, port) {
    this.host = host
    this.port = port
    this.headers = {
        'content-type': "text/xml",
        'date': "Mon, 17 Jul 1998 19:55:08 GMT",
        'user-agent': "Node RRCS Client Module"
    }

    this.client = xmlrpc.createClient({ host: this.host, port: this.port, headers: this.headers})
  }

  // ---------- Ports & XPs ---------- //
  /**
   * @callback getVersionCb
   * @param     {string}  TransKey - Transaction Key
   * @param     {string}  version - RRCS Version Number
   */

  /**
   * Get current version of RRCS
   * @return {getVersionCb}
   */
  async getVersion() {
    return new Promise((resolve, reject) => {
      this.client.methodCall('GetVersion', ['C0123456789'], (err, val) => {
        if (err) reject(err)
        resolve({
          TransKey: val[0],
          version: val[2]
        })
      })
    })
  }

  /**
   * @callback getStateCb
   * @param     {string}  TransKey - Transaction Key
   * @param     {string}  state - ['working', 'standby']
   */

  /**
   * Get current state of RRCS
   * @return {getStateCb}
   */
  async getState() {
    return new Promise((resolve, reject) => {
      this.client.methodCall('GetState', ['C0123456789'], (err, val) => {
        if (err) reject(err)
        resolve({
          TransKey: val[0],
          state: val[2]
        })
      })
    })
  }

  /**
   * @callback isConnectedToArtistCb
   * @param     {string}  TransKey - Transaction Key
   * @param     {boolean}  isConnected - RRCS is currently connected to Artist
   */

  /**
   * Check if RRCS is connected to Artist
   * @return {isConnectedToArtistCb}
   */
  async isConnectedToArtist() {
    return new Promise((resolve,reject) => {
      this.client.methodCall('IsConnectedToArtist', ['C0123456789'], (err, val) => {
        if (err) reject(err)
        resolve({
          TransKey: val.TransKey,
          isConnected: val.IsConnected,
        })
      })
    })
  }

  // ---------- Ports & XPs ---------- //

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
  async getObjects() {
    return new Promise(async (resolve, reject) => {
      let objects = {
        logic: {},
        gpio: {}
      }

      await clientRequest(this.client, 'GetObjectList', ['C0123456789', 'port'], (res) => {
        if (res.err) reject(err)
        objects.ports = res.val.ObjectList
      })

      await clientRequest(this.client, 'GetObjectList', ['C0123456789', 'conference'], (res) => {
        if (res.err) reject(err)
        objects.conferences = res.val.ObjectList
      })

      await clientRequest(this.client, 'GetObjectList', ['C0123456789', 'group'], (res) => {
        if (res.err) reject(err)
        else objects.groups = res.val.ObjectList
      })

      await clientRequest(this.client, 'GetObjectList', ['C0123456789', 'ifb'], (res) => {
        if (res.err) reject(err)
        objects.ifbs = res.val.ObjectList
      })

      await clientRequest(this.client, 'GetObjectList', ['C0123456789', 'logic-source'], (res) => {
        if (res.err) reject(err)
        objects.logic.srcs = res.val.ObjectList
      })

      await clientRequest(this.client, 'GetObjectList', ['C0123456789', 'logic-destination'], (res) => {
        if (res.err) reject(err)
        objects.logic.dests = res.val.ObjectList
      })

      await clientRequest(this.client, 'GetObjectList', ['C0123456789', 'gp-input'], (res) => {
        if (res.err) reject(err)
        objects.gpio.inputs = res.val.ObjectList
      })

      await clientRequest(this.client, 'GetObjectList', ['C0123456789', 'gp-output'], (res) => {
        if (res.err) reject(err)
        objects.gpio.outputs = res.val.ObjectList
      })

      await clientRequest(this.client, 'GetObjectList', ['C0123456789', 'user'], (res) => {
        if (res.err) reject(err)
        objects.users = res.val.ObjectList
      })

      await clientRequest(this.client, 'GetObjectList', ['C0123456789', 'audiopatch'], (res) => {
        if (res.err) reject(err)
        objects.audiopatches = res.val.ObjectList
      })

      await clientRequest(this.client, 'GetObjectList', ['C0123456789', 'client-card'], (res) => {
        if (res.err) reject(err)
        objects.clientCards = res.val.ObjectList
      })

      resolve(objects)
    })
  }

  /**
   * Get all ports in the system
   * @param  {int} id - ObjectID
   * @return {array}   {Input: bool, KeyCount: int, Label: str, Name: str, Node: int, ObjectID: int, Output: bool, PageCount: int, Port: int, PortType: str}
   */
  async getAllPorts() {
    return new Promise((resolve, reject) => {
      this.client.methodCall('GetAllPorts', ['C0123456789'], (err, val) => {
        if (err) reject(err)
        resolve(val[1])
      })
    })
  }

  /**
   * Get all properties from a particular object
   * @param  {int} id - ObjectID
   * @return {object}   properites - Properites object varies depending on object type
   */
  async getObjectProperties(id) {
    return new Promise((resolve, reject) => {
      this.client.methodCall('GetObjectProperty', ['C0123456789', id, ''], (err, val) => {
        if (err) reject(err)
        resolve(val)
      })
    })
  }

  /**
   * Get all properties from a particular object
   * @return {object} {TransKey, XP Count: XPs in this obj, XP#n...: [srcNet, srcNode, srcPort, destNet, destNode, destPort]}
   */
  async getAllActiveXps() {
    return new Promise((resolve, reject) => {
      this.client.methodCall('GetAllActiveXps', ['C0123456789'], (err, val) => {
        if (err) reject(err)
        resolve(val)
      })
    })
  }

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
  async getXpStatus(src, dest) {
    return new Promise((resolve, reject) => {
      this.client.methodCall('GetXpStatus', ['C0123456789', src.net, src.node, src.port, dest.net, dest.node, dest.port], (err, val) => {
        if (err) reject(err)
        resolve({
          TransKey: val[0],
          xpActive: val[2]
        })
      })
    })
  }

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
  async getXpVolume(src, dest) {
    return new Promise((resolve, reject) => {
      this.client.methodCall('GetXpVolume', ['C0123456789',src.net, src.node, src.port, dest.net, dest.node, dest.port], (err, val) => {
        if (err) reject(err)
        resolve({
          TransKey: val[0],
          singleVolume: val[2],
          confVolume: val[3]
        })
      })
    })
  }

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
  async getInputGain(src) {
    return new Promise((resolve, reject) => {
      this.client.methodCall('GetInputGain', ['C0123456789',src.net, src.node, src.port], (err, val) => {
        if (err) reject(err)
        resolve({
          TransKey: val[0],
          gain: val[2]
        })
      })
    })
  }

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
  async getOutputGain(src) {
    return new Promise((resolve, reject) => {
      this.client.methodCall('GetOutputGain', ['C0123456789',src.net, src.node, src.port], (err, val) => {
        if (err) reject(err)
        resolve({
          TransKey: val[0],
          gain: val[2]
        })
      })
    })
  }

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
  async getGPInputStatus(src) {
    return new Promise((resolve, reject) => {
      this.client.methodCall('GetGpInputStatus', ['C0123456789',src.net, src.node, src.port, src.gpio], (err, val) => {
        if (err) reject(err)
        resolve({
          TransKey: val[0],
          status: val[2]
        })
      })
    })
  }

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
  async getGPOutputStatus(src) {
    return new Promise((resolve, reject) => {
      this.client.methodCall('GetGpOutputStatus', ['C0123456789',src.net, src.node, src.port, src.gpio], (err, val) => {
        if (err) reject(err)
        resolve({
          TransKey: val[0],
          status: val[2]
        })
      })
    })
  }

  /**
   * Get Logic Sources
   * @return {object} {TransKey: int, ErrorCode: int, LogicSourceCount: int, LogicSource#x: [longName, label, Id, state]}
   */
  async getLogicSources() {
    return new Promise((resolve, reject) => {
      this.client.methodCall('GetAllLogicSources_v2', ['C0123456789'], (err, val) => {
        if (err) reject(err)
        resolve(val)
      })
    })
  }

  /**
   * Get all IFBs
   * @param  {int} id - ObjectID
   * @return {array}   { Input: { IsInput: bool, Node: int, Port: int }, Label: str, LongName: str, MixMinus: { IsInput: bool, Node: int, Port: int }, Number: int, ObjectID: int, Output: { IsInput: bool, Node: int, Port: int }, Owner: int }
   */
  async getAllIFBs() {
    return new Promise((resolve, reject) => {
      this.client.methodCall('GetAllIFBs', ['C0123456789'], (err, val) => {
        if (err) reject(err)
        resolve(val[1])
      })
    })
  }

  /**
   * Get All Active Port Clones
   * @return {array}
   */
  async getAllActivePortClones() {
    return new Promise((resolve, reject) => {
      this.client.methodCall('GetAllActivePortClones', ['C0123456789'], (err, val) => {
        if (err) reject(err)
        resolve(val[1])
      })
    })
  }

  /**
   * Get all trunk ports
   * @return {array}
   */
  async getAllTrunkPorts() {
    return new Promise((resolve, reject) => {
      this.client.methodCall('GetTrunkPorts', ['C0123456789'], (err, val) => {
        if (err) reject(err)
        resolve(val)
      })
    })
  }

  /**
   * Get trunk line setup
   * @return {array} {DestNetName: str, DestNetTrAddr: int, DestPortName: str, DestTrAddr: int, SrcNetName: str, SrcNetTrAddr: int, SrcPortName: str, SrcPortTrAddr: int}
   */
  async getTrunklineSetup() {
    return new Promise((resolve, reject) => {
      this.client.methodCall('GetTrunklineSetup', ['C0123456789'], (err, val) => {
        if (err) reject(err)
        resolve(val[2])
      })
    })
  }

  /**
   * Get trunk line activity
   * @return {array} { DestTrAddr: { DestObjAddr: int, NetTrAddr: int }, Priority: int, SrcTrAddr: { NetTrAddr: int, SrcObjAddr: int }, TrunkCmdType: int, TrunklinePath: [ { dNetTrAddr: int, dPortTrAddr: int, sNetTrAddr: int, sPortTrAddr: int }, { dNetTrAddr: int, dPortTrAddr: int, sNetTrAddr: int, sPortTrAddr: int } ] }
   */
  async getTrunklineActivity() {
    return new Promise((resolve, reject) => {
      this.client.methodCall('GetTrunklineActivities', ['C0123456789'], (err, val) => {
        if (err) reject(err)
        resolve(val[2])
      })
    })
  }

}

export { RRCS_Client }
