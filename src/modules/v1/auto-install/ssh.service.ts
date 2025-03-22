import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Client } from 'ssh2';

@Injectable()
export class SshService {
    private sshClient: Client;
    private socket: Socket;

    connectSSH(socket: Socket, host: string, username: string, password: string) {
        this.socket = socket;
        this.sshClient = new Client();

        this.sshClient.on('ready', () => {
            this.socket.emit('ssh_status', 'connected');
            this.runCommand('whoami'); // Example command
        });

        this.sshClient.on('error', err => {
            this.socket.emit('ssh_error', err.message);
        });

        this.sshClient.connect({
            host,
            username,
            password,
        });
    }

    runCommand(command: string) {
        this.sshClient.exec(command, (err, stream) => {
            if (err) {
                this.socket.emit('ssh_output', `Error: ${err.message}`);
                return;
            }

            stream.on('data', data => {
                this.socket.emit('ssh_output', data.toString());

                if (data.toString().includes('password:')) {
                    this.socket.emit('ssh_prompt', 'Enter password:');
                }
            });

            stream.stderr.on('data', data => {
                this.socket.emit('ssh_output', `Error: ${data.toString()}`);
            });

            stream.on('close', () => {
                this.socket.emit('ssh_output', '\nCommand finished.');
            });
        });
    }

    handleUserInput(input: string) {
        this.sshClient.exec(input, (err, stream) => {
            if (err) {
                this.socket.emit('ssh_output', `Error: ${err.message}`);
                return;
            }

            stream.on('data', data => {
                this.socket.emit('ssh_output', data.toString());
            });

            stream.stderr.on('data', data => {
                this.socket.emit('ssh_output', `Error: ${data.toString()}`);
            });

            stream.on('close', () => {
                this.socket.emit('ssh_output', '\nCommand finished.');
            });
        });
    }
}
