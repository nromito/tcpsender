import { Socket, connect } from "net";

import * as readline from 'readline';

process.on('SIGINT', () => {
  process.exit(0);
});

main();

function main() {
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
}


let socket: Socket;
let input: readline.Interface;

function initConnection(host: string, port: number) {
  process.stdout.write('Connecting...');
  run(host, port);
}

function run(host: string, port: number): void {
  socket = connect({host, port}, () => {
    process.stdout.write('\nConnected!\n');
    input = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '>'
    });
    input.prompt();
    input
      .on('line', line => {
        socket.write(line + '\n');
        input.prompt();
      })
  })
  .on('error', err => {
    if ((err as any).code !== 'ECONNREFUSED') return;
    setTimeout(() => {
      process.stdout.write('.');
      return run(host, port);
    }, 1000);
  })
  .on('close', (hadError) => {
    if (!hadError) return initConnection(host, port);
  })
}