import { Socket, connect } from "net";

import * as readline from 'readline';

process.on('SIGINT', () => {
  process.exit(0);
});
let p: Promise<any> = Promise.resolve();
if (process.argv.length < 4) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  p = p.then(() => new Promise((resolve, reject) => {
    rl.question('Host: ', answer => {
      resolve(answer);
    });
  }))
  .then((host) => new Promise((resolve, reject) => {
    rl.question('Port: ', answer => {
      resolve({host, port: parseInt(answer)});
      rl.close();
    });
  }))
} else {
  p = p.then(() => {
    const host = process.argv[2];
    const port = parseInt(process.argv[3]);
    return {host, port};
  })
}
p.then((hp) => initConnection(hp.host, hp.port));


function initConnection(host: string, port: number) {
  process.stdout.write('Connecting...');
  retry(host, port).then((socket) => {
    socket.on('close', () => initConnection(host, port));
    process.stdout.write('\nConnected!\n');
  });
}

function retry(host: string, port: number): Promise<Socket> {
  return connectTo(host, port).catch(err => {
    if (err.code !== 'ECONNREFUSED') return Promise.resolve() as Promise<any>;
    process.stdout.write('.');
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        retry(host, port).then(resolve).catch(reject);
      }, 1000);
    })
  });
}

function connectTo(host: string, port: number): Promise<Socket> {
  return new Promise((resolve, reject) => {
    let socket = connect({host, port}, () => {
      process.stdin.pipe(socket);
      resolve(socket);
    })
    .on('error', err => {
      socket.destroy();
      reject(err);
    })
  })
}