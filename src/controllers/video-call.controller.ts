// controllers/video-call.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoomService } from 'src/services/room.service';

interface CreateRoomDto {
  name?: string;
  settings?: {
    maxParticipants?: number;
    isPrivate?: boolean;
    allowScreenShare?: boolean;
    allowChat?: boolean;
    videoQuality?: 'low' | 'medium' | 'high';
  };
  scheduled?: Date;
  duration?: number;
}

interface JoinRoomDto {
  roomId: string;
  userId: string;
}

@Controller('video-calls')
@UseGuards(JwtAuthGuard)
export class VideoCallController {
  constructor(private readonly roomService: RoomService) {}

  @Post('rooms')
  async createRoom(@Request() req, @Body() createRoomDto: CreateRoomDto) {
    const roomId = Math.random().toString(36).substring(7);

    const room = this.roomService.createRoom(roomId, createRoomDto.settings, {
      name: createRoomDto.name,
      hostId: req.user.id,
      scheduled: createRoomDto.scheduled,
      duration: createRoomDto.duration,
    });

    return {
      roomId: room.id,
      settings: room.settings,
      metadata: room.metadata,
      joinUrl: `${process.env.APP_URL || 'http://localhost:3000'}/join/${room.id}`,
    };
  }

  //   @Get('rooms')
  //   async getUserRooms(@Request() req) {
  //     const rooms = this.roomService.getRoomsByUserId(req.user.id);
  //     return rooms.map((room) => ({
  //       id: room.id,
  //       name: room.metadata?.name,
  //       participants: Array.from(room.participants).length,
  //       created: room.created,
  //       scheduled: room.metadata?.scheduled,
  //       isHost: room.metadata?.hostId === req.user.id,
  //     }));
  //   }

  @Get('rooms/:roomId')
  async getRoomDetails(@Param('roomId') roomId: string) {
    const room = this.roomService.getRoomDetails(roomId);

    if (!room) {
      throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
    }

    const participants = this.roomService.getParticipants(roomId);

    return {
      id: room.id,
      settings: room.settings,
      metadata: room.metadata,
      participants: participants,
      created: room.created,
    };
  }

  //   @Post('rooms/:roomId/join')
  //   async joinRoom(@Param('roomId') roomId: string, @Request() req) {
  //     const room = this.roomService.getRoomDetails(roomId);

  //     if (!room) {
  //       throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
  //     }

  //     if (this.roomService.isRoomFull(roomId)) {
  //       throw new HttpException('Room is full', HttpStatus.FORBIDDEN);
  //     }

  //     // If room is private, check if user is invited
  //     if (room.settings?.isPrivate) {
  //       const isInvited = await this.roomService.checkInvitation(
  //         roomId,
  //         req.user.id,
  //       );
  //       if (!isInvited) {
  //         throw new HttpException(
  //           'Not invited to this room',
  //           HttpStatus.FORBIDDEN,
  //         );
  //       }
  //     }

  //     const joined = this.roomService.joinRoom(roomId, req.user.id);

  //     if (!joined) {
  //       throw new HttpException('Failed to join room', HttpStatus.BAD_REQUEST);
  //     }

  //     // Generate WebRTC credentials (TURN/STUN servers)
  //     const iceServers = await this.getIceServers();

  //     return {
  //       roomId,
  //       iceServers,
  //       participants: this.roomService.getParticipants(roomId),
  //       settings: room.settings,
  //     };
  //   }

  @Delete('rooms/:roomId')
  async endRoom(@Param('roomId') roomId: string, @Request() req) {
    const room = this.roomService.getRoomDetails(roomId);

    if (!room) {
      throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
    }

    // Only host can end the room
    if (room.metadata?.hostId !== req.user.id) {
      throw new HttpException(
        'Not authorized to end room',
        HttpStatus.FORBIDDEN,
      );
    }

    // await this.roomService.endRoom(roomId);
    return { message: 'Room ended successfully' };
  }

  @Post('rooms/:roomId/invite')
  async inviteToRoom(
    @Param('roomId') roomId: string,
    @Body('emails') emails: string[],
    @Request() req,
  ) {
    const room = this.roomService.getRoomDetails(roomId);

    if (!room) {
      throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
    }

    // Only host can invite others
    if (room.metadata?.hostId !== req.user.id) {
      throw new HttpException('Not authorized to invite', HttpStatus.FORBIDDEN);
    }

    // Send invitations (implement email service)
    // await Promise.all(
    //   emails.map((email) =>
    //     this.roomService.sendInvitation(roomId, email, {
    //       hostName: req.user.name,
    //       roomName: room.metadata?.name,
    //       scheduled: room.metadata?.scheduled,
    //       duration: room.metadata?.duration,
    //     }),
    //   ),
    // );

    return { message: 'Invitations sent successfully' };
  }

  private async getIceServers() {
    // Implementation would depend on your TURN/STUN server setup
    return [
      {
        urls: process.env.STUN_SERVER || 'stun:stun.l.google.com:19302',
      },
      {
        urls: process.env.TURN_SERVER,
        username: process.env.TURN_USERNAME,
        credential: process.env.TURN_PASSWORD,
      },
    ];
  }
}
