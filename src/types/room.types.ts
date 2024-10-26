// types/room.types.ts
export interface RoomData {
    id: string;
    participants: Set<string>;  // Set of user IDs in the room
    created: Date;
    settings?: RoomSettings;    // Optional room configuration
    metadata?: RoomMetadata;    // Additional room information
  }
  
  export interface RoomSettings {
    maxParticipants: number;
    isPrivate: boolean;
    allowScreenShare: boolean;
    allowChat: boolean;
    videoQuality?: 'low' | 'medium' | 'high';
  }
  
  export interface RoomMetadata {
    name?: string;
    description?: string;
    hostId?: string;
    duration?: number;  // Meeting duration in minutes
    scheduled?: Date;   // For scheduled meetings
  }
  
  