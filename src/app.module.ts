import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomService } from './services/room.service';
import { VideoCallGateway } from './lib/video-call.gateway';
import { VideoCallController } from './controllers/video-call.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app-config';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('DATABASE'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController, VideoCallController],
  providers: [AppService, RoomService, VideoCallGateway],
})
export class AppModule {}
