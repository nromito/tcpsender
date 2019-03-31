"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net_1 = require("net");
process.on('SIGINT', function () {
    process.exit(0);
});
if (process.argv.length < 4) {
    console.log('Invalid args', process.argv);
    process.exit(1);
}
var socket = net_1.connect({ host: process.argv[2], port: parseInt(process.argv[3]) }, function () {
    process.stdin.pipe(socket);
});
socket.on('error', function (err) {
    console.error(err);
});
