import { Socket, connect } from "net";

process.on('SIGINT', () => {
  process.exit(0);
});

if (process.argv.length < 4) {
  console.log('Invalid args', process.argv);
  process.exit(1);
}

const socket = connect({host: process.argv[2], port: parseInt(process.argv[3])}, () => {
  process.stdin.pipe(socket);
});
socket.on('error', err => {
  console.error(err);
});