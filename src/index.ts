import { Socket, connect } from "net";

process.on('SIGINT', () => {
  process.exit(0);
});

if (process.argv.length < 4) {
  console.log('usage: ', process.argv);
  process.exit(1);
}
initConnection();

function initConnection() {
  process.stdout.write('Connecting...');
  retry().then((socket) => {
    socket.on('close', () => initConnection());
    process.stdout.write('\nConnected!\n');
  });
}

function retry(): Promise<Socket> {
  return connectTo(process.argv[2], parseInt(process.argv[3])).catch(err => {
    if (err.code !== 'ECONNREFUSED') return Promise.resolve() as Promise<any>;
    process.stdout.write('.');
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        retry().then(resolve).catch(reject);
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