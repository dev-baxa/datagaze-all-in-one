// import { Injectable, Logger } from '@nestjs/common';
// import {
//     OnGatewayConnection,
//     OnGatewayDisconnect,
//     WebSocketGateway,
//     WebSocketServer,
//     WsException,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { ComputerAuthService } from './computer.auth.service';

// @Injectable()
// @WebSocketGateway(3502, { namespace: 'agent', cors: true })
// export class AgentWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
//     private readonly logger = new Logger(AgentWebSocketGateway.name);

//     constructor(private readonly authService: ComputerAuthService) {}

//     @WebSocketServer()
//     server: Server;

//     private agentConnections: Map<string, Socket> = new Map();

//     async handleConnection(client: Socket) {
//         const token = client.handshake.headers.authorization?.split(' ')[1];

//         if (!token) {
//             new WsException('Unauthorized');
//             client.disconnect();
//             return;
//         }

//       const payload = this.authService.verifyToken(token);
      
      
//     }
// }
