// DOM Elements
const connectButton = document.getElementById('connectButton');
const productIdInput = document.getElementById('productId');
const productInfoPanel = document.getElementById('productInfo');
const serverInfoPanel = document.getElementById('serverInfo');
const commandInput = document.getElementById('commandInput');
const sendCommandButton = document.getElementById('sendCommand');

// Terminal variables
let terminal;
let socket;
let connected = false;

// Initialize xterm.js terminal
function initTerminal() {
    // Create terminal
    terminal = new Terminal({
        cursorBlink: true,
        theme: {
            background: '#000000',
            foreground: '#ffffff',
        },
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        fontSize: 14,
        lineHeight: 1.2,
        scrollback: 1000,
    });

    // Load FitAddon for terminal sizing
    const fitAddon = new FitAddon.FitAddon();
    terminal.loadAddon(fitAddon);

    // Open terminal in the container
    terminal.open(document.getElementById('terminal'));
    fitAddon.fit();

    // Handle window resize
    window.addEventListener('resize', () => {
        fitAddon.fit();
    });

    // Welcome message
    terminal.writeln('Welcome to Remote Server Terminal');
    terminal.writeln('Enter a Product ID and click "Connect" to start');
    terminal.writeln('');
}

// Initialize Socket.IO connection
function initSocketConnection() {
    // Backend URL - Bu qismni o'z backendingiz URL manziliga o'zgartiring
    const backendUrl = 'http://localhost:4000'; // O'z backendingiz manzilini ko'rsating

    // Connect to the backend server
    socket = io(backendUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    // Socket connection established
    socket.on('connect', () => {
        terminal.writeln('Socket connection established');
        console.log('Socket connected with ID:', socket.id);
    });

    // Socket connection error
    socket.on('connect_error', error => {
        console.error('Connection error:', error);
        terminal.writeln(`Connection error: ${error.message}`);
    });

    // Socket disconnection
    socket.on('disconnect', reason => {
        console.log('Socket disconnected:', reason);
        terminal.writeln(`\r\nDisconnected: ${reason}`);
        resetConnection();
    });

    // Handle server messages
    socket.on('message', data => {
        terminal.writeln(data);
    });

    // Handle command output from server
    socket.on('ssh_output', data => {
        terminal.write(data);
    });

    // Handle SSH connection status
    socket.on('ssh_status', status => {
        if (status === 'connected') {
            connected = true;
            terminal.writeln('\r\nSSH connection established to server');

            // Enable command input
            commandInput.disabled = false;
            sendCommandButton.disabled = false;

            // Update UI
            connectButton.disabled = false;
        }
    });

    // Handle SSH connection errors
    socket.on('ssh_error', error => {
        console.error('SSH Error:', error);
        terminal.writeln(`\r\nSSH Error: ${error}`);
        resetConnection();
    });
}

// Connect to a server using product ID
function connectToServer() {
    const productId = productIdInput.value.trim();

    if (!productId) {
        terminal.writeln('Please enter a Product ID');
        return;
    }

    // Clear previous information
    productInfoPanel.innerHTML = '';
    serverInfoPanel.innerHTML = '';

    // Disable connect button during connection
    connectButton.disabled = true;

    terminal.writeln(`\r\nAttempting to connect using Product ID: ${productId}...`);

    // Send connect request to the server - Backend SubscribeMessage decoratordagi event nomi
    socket.emit('connectToServer', { productId });
    console.log('Sent connectToServer with productId:', productId);
}

// Send command to the server
function sendCommand() {
    const command = commandInput.value.trim();

    if (!command) return;

    if (!connected) {
        terminal.writeln('Not connected to any server');
        return;
    }

    // Send command to server - Backend SubscribeMessage decoratordagi event nomi
    socket.emit('runCommand', { command });
    console.log('Sent command:', command);

    // Clear command input
    commandInput.value = '';
}

// Reset connection state
function resetConnection() {
    connected = false;
    connectButton.disabled = false;
    commandInput.disabled = true;
    sendCommandButton.disabled = true;
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');

    // Initialize terminal
    initTerminal();

    // Initialize socket connection
    initSocketConnection();

    // Disable command input until connected
    commandInput.disabled = true;
    sendCommandButton.disabled = true;

    // Add event listeners
    connectButton.addEventListener('click', connectToServer);
    sendCommandButton.addEventListener('click', sendCommand);

    // Allow pressing Enter in command input
    commandInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            sendCommand();
        }
    });

    // Allow pressing Enter in product ID input
    productIdInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            connectToServer();
        }
    });
});
