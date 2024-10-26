import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  controllers: [],
  exports: [UsersService],
  imports: [],
  providers: [UsersService],
})
export class UsersModule {}
