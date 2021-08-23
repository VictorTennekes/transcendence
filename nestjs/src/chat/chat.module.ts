import { Module } from '@nestjs/common';
import { ChatController } from '@chat/chat.controller';
import { chatService } from '@chat/chat.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { chatEntity } from '@chat/entity/chat.entity';
import { MessageEntity } from './entity/message.entity';
import { UserService } from '@user/user.service';
import { UserEntity } from '@user/entities/user.entity';

@Module({
	controllers: [ChatController],
	providers: [
		chatService,
		UserService
	],
	imports: [
		ConfigModule,
		TypeOrmModule.forFeature([
			chatEntity,
			MessageEntity,
			UserEntity
		])
	]
})
export class ChatModule {}
