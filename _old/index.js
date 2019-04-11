var client = require ("./lib/client.js");
var server = require("./lib/server.js");

// module.exports = {
//   client: client,
//   server: server
// }
var host = {ip: "172.16.7.215", port: "8193"}
var local = {ip: "10.0.10.247", port: "9090"}

server.run(host, local )

client.registerForAllEvents(host, 9090, "/")
