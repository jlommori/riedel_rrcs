var xmlrpc = require('xmlrpc')
var http = require('http')
var net = require('net');
var parseString = require('xml2js').parseString;
var util = require('util');
var chalk = require('chalk');

var headers = {
    'content-type': "text/xml",
    'date': "Mon, 17 Jul 1998 19:55:08 GMT",
    'user-agent': "Node RRCS Module"
}

/**
 * standardCallback
 *
 * @callback
 * @param  {Obj} error - error returned from RRCS
 * @param  {Obj} value - valid response returned from RRCS
 * @return {Obj} status - {status, value}
 */
function standardCallback(error, value) {
  if (error !== null) {
    console.log('Error:')
    console.log(error)
    var r = {
      "status": "error",
      "value": error
    }
    return r
  } else {
    console.log('Value:')
    console.log(value)
    var r = {
      "status": "success",
      "value": value
    }
    return r
  }
}

/**
 * Perform a setXp command
 *
 * @public
 * @param  {Obj} host - {ip, port}
 * @param  {Obj} src - {net, node, portId}
 * @param  {Obj} dest - {net, node, portId}
 * @return {Obj} status - {status, value}
 */
 var setXp = function(host, src, dest) {
    var client = xmlrpc.createClient({ host: host.ip, port: host.port, headers: headers})

    client.methodCall(
      'setXp',
      ['C0123456789', src.net, src.node, src.portId, dest.net, dest.node, dest.portId],
      function(error, value) {
        standardCallback(error, value);
      })
 }

  /**
   * Perform a killXp command
   *
   * @param  {Obj} host - {ip, port}
   * @param  {Obj} src - {net, node, portId}
   * @param  {Obj} dest - {net, node, portId}
   * @return {Obj} status - {status, value}
   */
  var killXp = function(host, src, dest) {
    var client = xmlrpc.createClient({ host: host.ip, port: host.port, headers: headers})

    client.methodCall(
      'killXp',
      ['C0123456789', src.net, src.node, src.portId, dest.net, dest.node, dest.portId],
      function(error, value) {
        standardCallback(error, value);
      })
  }

  /**
   * Perform a RegisterForAllEvents command
   *
   * @param  {Obj} host - {ip, port}
   * @param  {int} tcp - TCP Port for receiving events
   * @param  {string} url - URL of receiving xml-rpc server
   * @return {Obj} status - {status, value}
   */
  var registerForAllEvents = function(host, tcp, url) {
    var client = xmlrpc.createClient({ host: host.ip, port: host.port, headers: headers})

    client.methodCall(
      'RegisterForAllEvents',
      ['C0123456789', tcp, url, true, false],
      function(error, value) {
        standardCallback(error, value);
      })
  }

  /**
   * Perform an unRegisterForAllEvents command
   *
   * @param  {Obj} host - {ip, port}
   * @param  {int} tcp - TCP Port for receiving events
   * @param  {string} url - URL of receiving xml-rpc server
   * @return {Obj} status - {status, value}
   */
  var unregisterForAllEvents = function(host, tcp, url) {
    var client = xmlrpc.createClient({ host: host.ip, port: host.port, headers: headers})

    client.methodCall(
      'UnregisterForAllEvents',
      ['C0123456789', tcp, url],
      function(error, value) {
        standardCallback(error, value);
      })
  }

  /**
   * Perform an changePanelSpyRegistry command
   *
   * @param  {Obj} host - {ip, port}
   * @param  {int} tcp - TCP Port for receiving events
   * @param  {string} url - URL of receiving xml-rpc server
   * @param  {Obj} src - {node, port}
   * @param  {Obj} events - {rotate, key, func, numKey}
   * @return {Obj} status - {status, value}
   */
  var changePanelSpyRegistry = function(host, tcp, url, src, events) {
    var client = xmlrpc.createClient({ host: host.ip, port: host.port, headers: headers})

    client.methodCall(
      'ChangePanelSpyRegistry',
      ['C0123456789', tcp, url, src.node, src.portId, {
        "RotateEventsOn": events.rotate,
        "KeyEventsOn": events.key,
        "FuncKeyEventsOn": events.func,
        "NumKeyEventsOn": events.numKey
      }],
      function(error, value) {
        standardCallback(error, value);
      })
  }

/** @module client */
module.exports = {
  /** setXp method */
   setXp: setXp,
   /** killXp method */
   killXp: killXp,
   /** registerForAllEvents method */
   registerForAllEvents: registerForAllEvents,
   /** unregisterForAllEvents method */
   unregisterForAllEvents: unregisterForAllEvents,
   /** changePanelSpyRegistry method */
   changePanelSpyRegistry: changePanelSpyRegistry
 };
