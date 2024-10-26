import { Injectable } from '@nestjs/common';
import { RoomData, RoomMetadata, RoomSettings } from 'src/types/room.types';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class RoomService {
  private rooms = new Map<string, RoomData>();
  constructor() {
    this.loadRoomsFromFile();
  }
  private saveRoomsToFile(): void {
    const filePath = path.join(__dirname, '../../data/rooms.json');
    const roomArray = Array.from(this.rooms.values()).map((room) => ({
      ...room,
      participants: Array.from(room.participants), // Convert Set back to array
      created: room.created.toISOString(), // Convert Date back to string
    }));

    fs.writeFileSync(filePath, JSON.stringify(roomArray, null, 2), 'utf-8');
  }
  private loadRoomsFromFile(): void {
    const filePath = path.join(__dirname, '../../data/rooms.json');
    if (fs.existsSync(filePath)) {
      const jsonData = fs.readFileSync(filePath, 'utf-8');
      const roomArray: RoomData[] = JSON.parse(jsonData);
      roomArray.forEach((room) => {
        this.rooms.set(room.id, {
          ...room,
          participants: new Set<string>(room.participants), // convert array to Set
          created: new Date(room.created), // convert string to Date
        });
      });
    }
  }
  createRoom(
    roomId: string,
    settings?: Partial<RoomSettings>,
    metadata?: Partial<RoomMetadata>,
  ): RoomData {
    const defaultSettings: RoomSettings = {
      maxParticipants: 10,
      isPrivate: false,
      allowScreenShare: true,
      allowChat: true,
      videoQuality: 'medium',
    };

    const room: RoomData = {
      id: roomId,
      participants: new Set<string>(),
      created: new Date(),
      settings: { ...defaultSettings, ...settings },
      metadata: metadata || {},
    };

    this.rooms.set(roomId, room);
    this.saveRoomsToFile();
    return room;
  }

  getRoomDetails(roomId: string): RoomData | undefined {
    console.log('roomId', roomId);
    console.log('this.rooms', this.rooms);

    return this.rooms.get(roomId);
  }

  isRoomFull(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return true;
    return room.participants.size >= room.settings.maxParticipants;
  }

  // Add a participant to a room
  joinRoom(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || this.isRoomFull(roomId)) return false;

    room.participants.add(userId);
    return true;
  }

  // Remove a participant from a room
  leaveRoom(roomId: string, userId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants.delete(userId);
      // Clean up empty rooms
      if (room.participants.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  // Update room settings
  updateRoomSettings(roomId: string, settings: Partial<RoomSettings>): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.settings = { ...room.settings, ...settings };
    return true;
  }

  // Get all participants in a room
  getParticipants(roomId: string): string[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.participants) : [];
  }
}
