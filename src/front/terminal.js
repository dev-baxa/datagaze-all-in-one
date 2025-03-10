import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import io from 'socket.io-client';
import 'xterm/css/xterm.css';

// WebSocketga ulanamiz
const socket = io('ws://localhost:4000');

const term = new Terminal({ cursorBlink: true });
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById('terminal-container'));
fitAddon.fit();

term.writeln('NestJS Terminalga xush kelibsiz!\r\n');

socket.on('output', data => {
    term.write(data);
});

term.onData(input => {
    socket.emit('command', input);
});
