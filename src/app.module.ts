import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import appConfig, { AppConfig } from './config/app-config';
import { VideoCallController } from './controllers/video-call.controller';
import { VideoCallGateway } from './lib/video-call.gateway';
import { RoomService } from './services/room.service';
import { UsersModule } from './users/users.module';

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
      useFactory: async (configService: ConfigService<AppConfig>) => ({
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
