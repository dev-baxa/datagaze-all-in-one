export function handleSshError(err: Error): string {
    if (err.message.includes('Cannot parse privateKey')) {
        return 'Invalid private key format. Please check your key file.';
    } else if (err.message.includes('All configured authentication methods failed')) {
        return 'Authentication failed. Please check your username and password/private key.';
    } else if (err.message.includes('ECONNREFUSED')) {
        return 'Connection refused. Server might be unreachable.';
    }
    return 'Unknown error occurred while connecting to the server.';
}
