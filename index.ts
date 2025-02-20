import { readFileSync } from 'fs';
import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec('uptime', (err, stream) => {
    if (err) {
      throw err;
    }

    if (!stream) {
      console.error("Stream is undefined or null");
      conn.end();
      return;
    }

    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data: Buffer) => {
      console.log('STDOUT: ' + data.toString()); // Convert Buffer to string
    }).stderr.on('data', (data: Buffer) => {
      console.log('STDERR: ' + data.toString()); // Convert Buffer to string
    });
  });
}).on('error', (err) => {  // Handle connection errors
    console.error("Connection error:", err);
});


// Best practice: Store sensitive info like private keys securely (environment variables)
const privateKeyPath = process.env.SSH_PRIVATE_KEY_PATH || '/path/to/my/key'; // Fallback path if env variable is not set
try {
 const privateKey = readFileSync(privateKeyPath);
 conn.connect({
  host: '192.168.100.100',
  port: 22,
  username: 'frylock',
  privateKey: privateKey,
});
} catch (error) {
    console.error("Error reading private key:", error);
}


