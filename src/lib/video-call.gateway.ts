import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class VideoCallGateway {
  @WebSocketServer()
  server: Server;

  private rooms: Map<string, Set<string>> = new Map();

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, payload: { roomId: string; userId: string }) {
    const { roomId, userId } = payload;
console.log('roomId', roomId);
console.log('userId', userId);

    // Create room if doesn't exist
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }

    // Add user to room
    this.rooms.get(roomId).add(userId);
    client.join(roomId);

    // Notify others in room
    this.server.to(roomId).emit('userJoined', {
      userId,
      participants: Array.from(this.rooms.get(roomId)),
    });
  }

  @SubscribeMessage('offer')
  handleOffer(
    client: Socket,
    payload: {
      roomId: string;
      userId: string;
      offer: RTCSessionDescriptionInit;
    },
  ) {
    client.to(payload.roomId).emit('offer', {
      userId: payload.userId,
      offer: payload.offer,
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    client: Socket,
    payload: {
      roomId: string;
      userId: string;
      answer: RTCSessionDescriptionInit;
    },
  ) {
    client.to(payload.roomId).emit('answer', {
      userId: payload.userId,
      answer: payload.answer,
    });
  }

  @SubscribeMessage('iceCandidate')
  handleIceCandidate(
    client: Socket,
    payload: {
      roomId: string;
      userId: string;
      candidate: RTCIceCandidate;
    },
  ) {
    client.to(payload.roomId).emit('iceCandidate', {
      userId: payload.userId,
      candidate: payload.candidate,
    });
  }
}
