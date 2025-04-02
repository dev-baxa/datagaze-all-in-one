// DOM Elements
let connectButton;
let productIdInput;
let passwordInput; // Yangi qo‘shilgan password inputi
let productInfoPanel;
let serverInfoPanel;
let productInputSection;
let terminalSection;

// Terminal variables
let terminal;
let socket;
let connected = false;

// Initialize xterm.js terminal
function initTerminal() {
    terminal = new Terminal({
        cursorBlink: true,
        fontFamily: '"Fira Code", "JetBrains Mono", monospace',
        fontSize: 14,
        letterSpacing: 1,
        lineHeight: 1.2,
        theme: {
            background: '#000000',
            foreground: '#ffffff',
        },
    });

    const fitAddon = new FitAddon.FitAddon();
    terminal.loadAddon(fitAddon);

    terminal.open(document.getElementById('terminal'));
    fitAddon.fit();

    window.addEventListener('resize', () => {
        fitAddon.fit();
    });

    terminal.writeln('Welcome to Remote Server Terminal');
    terminal.writeln('');

    terminal.onData(data => {
        if (connected) {
            socket.emit('terminalData', { data });
        }
    });

    terminal.onKey(e => {
        if (e.key === '\r') {
            terminal.write('\r');
        }
    });
}

// Initialize Socket.IO connection
function initSocketConnection() {
    const backendUrl = 'http://localhost:4000/terminal';

    socket = io(backendUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        terminal.writeln('Socket connection established');
        console.log('Socket connected with ID:', socket.id);
    });

    socket.on('connect_error', error => {
        console.error('Connection error:', error);
        terminal.writeln(`Connection error: ${error.message}`);
    });

    socket.on('disconnect', reason => {
        console.log('Socket disconnected:', reason);
        terminal.writeln(`\r\nDisconnected: ${reason}`);
        resetConnection();
    });

    socket.on('message', data => {
        terminal.writeln(data);
    });

    socket.on('ssh_output', data => {
        console.log(data);
        terminal.write(data);
    });

    socket.on('ssh_status', status => {
        if (status === 'connected') {
            connected = true;
            terminal.writeln('\r\nSSH connection established to server');
            terminal.focus();
        }
    });

    socket.on('ssh_error', error => {
        console.error('SSH Error:', error);
        terminal.writeln(`\r\nSSH Error: ${error}`);
        resetConnection();
    });
}

// Connect to a server using product ID and password
function connectToServer() {
    const productId = productIdInput.value.trim();
    const password = passwordInput.value.trim(); // Password qiymatini olish

    // Agar Product ID yoki Password kiritilmagan bo‘lsa, ogohlantirish
    if (!productId || !password) {
        alert('Please enter both Product ID and Password');
        return;
    }

    // Clear previous information
    productInfoPanel.innerHTML = '';
    serverInfoPanel.innerHTML = '';

    // Disable connect button during connection
    connectButton.disabled = true;

    // Hide product input section and show terminal section
    productInputSection.style.display = 'none';
    terminalSection.style.display = 'block';

    terminal.writeln(`\r\nAttempting to connect using Product ID: ${productId}...`);

    // Send connect request to the server with both productId and password
    socket.emit('connectToServer', { productId, password });
    console.log('Sent connectToServer with productId:', productId, 'and password:', password);
}

// Reset connection state
function resetConnection() {
    connected = false;
    connectButton.disabled = false;
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');

    // DOM elementlarini tanlash
    connectButton = document.getElementById('connectButton');
    productIdInput = document.getElementById('productId');
    passwordInput = document.getElementById('password'); // Password inputini tanlash
    productInfoPanel = document.getElementById('productInfo');
    serverInfoPanel = document.getElementById('serverInfo');
    productInputSection = document.getElementById('productInputSection');
    terminalSection = document.getElementById('terminalSection');

    // DOM elementlari mavjudligini tekshirish
    if (
        !connectButton ||
        !productIdInput ||
        !passwordInput || // Password inputini tekshirish qo‘shildi
        !productInfoPanel ||
        !serverInfoPanel ||
        !productInputSection ||
        !terminalSection
    ) {
        console.error('One or more DOM elements not found');
        return;
    }

    // Initialize terminal
    initTerminal();

    // Initialize socket connection
    initSocketConnection();

    // Add event listeners
    connectButton.addEventListener('click', connectToServer);

    // Allow pressing Enter in product ID or password input
    productIdInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            connectToServer();
        }
    });

    passwordInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            connectToServer();
        }
    });
});
