# Riedel RRCS Nodejs Client & Server

Express Server for interacting with the Riedel RRCS XML-RPC application

## Installation

`npm install riedel_rrcs`

## Getting Started

The RRCS Nodejs Server provides both a client XLM-RPC interface for making requests to RRCS and a server interface for receiving notifications from RRCS.

```js

  import { RRCS_Server, RRCS_Client} from 'riedel_rrcs'

  //Make a request of RRCS for information
  let rrcs = new RRCS_Client('192.168.42.10', 8913) //IP Address and Port of RRCS
  rrcs.getAllPorts().then((ports) => {
    console.log('getAllPorts')
    console.log(ports)
  }).catch((err) => {
    console.error('getAllPorts Error')
    console.error(err)
  })


  //Setup a server to receive notifications from RRCS
  // local: {ip: '10.1.1.1', port: 3000}
  // remote: {ip: '192.168.42.10', port: 8193}
  // callback object
  let rrcs_server = new RRCS_Server(local, remote, {
    initial: function(msg) {
      console.log(msg)
    },
    error: function (msg, err) {
      console.error(msg)
      console.error(err)
    },
    registerForAllEvents: function (msg) {
      console.log(msg)
    },
    crosspointChange: function(params) {
      console.log('crosspointChange')
      console.log(params)
    },
    sendString: function(string) {
      console.log('sendString')
      console.log(string)
    }
  })

```

### RRCS_Client

`new RRCS_Client(ip, port)` Ip Address and Port of RRCS.

Overview Available RRCS Client Commands
* getVersion() - Get RRCS Version info
* getState() - Get RRCS Operational State (working or standby)
* isConnectedToArtist() - Get RRCS Artist connectivity state
* getObjects() - Get all objects from Artist system
* getAllPorts() - Get All Ports from the Artist System, including detailed port data
* getObjectProperties(id) - Get properties for a specific object
* getAllActiveXps() - Get all currently active XPs
* getXpStatus(src, dest) - Get XP status between src {net: int, node: int, port: int} & dest {net: int, node: int, port: int}
* getXpVolume(src, dest) - Get XP volume between src {net: int, node: int, port: int} & dest {net: int, node: int, port: int}
* getInputGain(src) - Get input gain for a port: src {net: int, node: int, port: int}
* getOutputGain(src) - Get output gain for a port: src {net: int, node: int, port: int}
* getGPInputStatus(src) - Get gpio input status src {net: int, node: int, port: int, gpio: int}
* getGPOutputStatus(src) - Get gpio output status src {net: int, node: int, port: int, gpio: int}
* getLogicSources() - Get all system logic sources
* getAllIFBs() - Get all system IFBs
* getAllActivePortClones() - Get all active port clones
* getAllTrunkPorts() - Get all ports enabled or used for trunking
* getTrunklineSetup() - Get trunkline setup as it relates to this system
* getTrunklineActivity() - Get current trunkline activity


### RRCS_Server

`new RRCS_Server(local, remote, callbacks)` IP and Port for local server and RRCS

Overview of available RRCS events:
* GetAlive - Ping from RRCS to verify server is still active
* CrosspointChange - XP Change in the system
* SendString - Send String command activated
* SendStringOff - Send String command de-activiated
* GpInputChange - GPIO Input changed
* LogicSourceChange - Logic Source changed
* ConfigurationChange - Alarm of a config change
* UpstreamFailed - Alarm of Upstream Fiber Failure
* UpstreamFaieldCleared - Alarm of Upstream Fiber Failure cleared
* DownstreamFailed - Alarm of Downstream Fiber Failure
* DownstreamFailedCleared - Alarm of Downstream Fiber Failure cleared
* NodeControllerFailed - Alarm of Node Controller Failure
* NodeControllerReboot - Alarm of Node Controller Reboot
* ClientFailed - Alarm of Client Card Failure
* ClientFailedCleared - Alarm of Client Card Failure cleared
* PortInactive - Alarm of Port becoming Inactive
* PortActive - Alarm of Port becoming Active
* ConnectArtistRestored - Alarm of Artist connectivity restored
* ConnectArtistFailed - Alarm of Artist connectivity failure
* GatewayShutdown - Alarm of RRCS Shutdown

## License

This project is licensed under the MIT License
