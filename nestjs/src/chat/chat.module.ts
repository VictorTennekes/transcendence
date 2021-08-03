import { Module } from '@nestjs/common';
import { ChatController } from '@chat/chat.controller';
import { chatService } from '@chat/chat.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { chatEntity } from '@chat/entity/chat.entity';
import { MessageEntity } from './entity/message.entity';

@Module({
  controllers: [ChatController],
  providers: [chatService],
  imports: [
      ConfigModule,
      TypeOrmModule.forFeature([chatEntity, MessageEntity],)
  ]
})
export class ChatModule {}
