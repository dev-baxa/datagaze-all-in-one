// DOM Elements
let connectButton;
let productIdInput;
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
    // Create terminal
    terminal = new Terminal({
        cursorBlink: true, // Kursor miltillashi
        fontFamily: '"Fira Code", "JetBrains Mono", monospace',
        fontSize: 14, // Shrift o‘lchami
        letterSpacing: 1, // Harflar orasidagi masofa
        lineHeight: 1.2, // Qatorlar orasidagi balandlik
        theme: {
            background: '#000000', // Orqa fon rangi
            foreground: '#ffffff', // Matn rangi
        },
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
    terminal.writeln('');

    // Handle terminal input
    terminal.onData(data => {
        if (connected) {
            
            // Send data to server
            socket.emit('terminalData', { data });
        }
    });

    // Handle Enter key for command submission
    terminal.onKey(e => {
        if (e.key === '\r') {
            // Enter key
            terminal.write('\r'); // Yangi qatorga o'tish
        }
    });
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
        console.log(data);
        terminal.write(data); // Serverdan kelgan ma'lumotlarni terminalda ko'rsatish
    });

    // Handle SSH connection status
    socket.on('ssh_status', status => {
        if (status === 'connected') {
            connected = true;
            terminal.writeln('\r\nSSH connection established to server');

            // Enable terminal input
            terminal.focus();
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
        alert('Please enter a Product ID');
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

    // Send connect request to the server
    socket.emit('connectToServer', { productId });
    console.log('Sent connectToServer with productId:', productId);
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
    productInfoPanel = document.getElementById('productInfo');
    serverInfoPanel = document.getElementById('serverInfo');
    productInputSection = document.getElementById('productInputSection');
    terminalSection = document.getElementById('terminalSection');

    // DOM elementlari mavjudligini tekshirish
    if (
        !connectButton ||
        !productIdInput ||
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

    // Allow pressing Enter in product ID input
    productIdInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            connectToServer();
        }
    });
});
