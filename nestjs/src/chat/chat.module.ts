import { Module } from '@nestjs/common';
import { ChatController } from '@chat/chat.controller';
import { ChatService } from '@chat/chat.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from '@chat/entity/chat.entity';
import { MessageEntity } from './entity/message.entity';
import { UserService } from '@user/user.service';
import { UserEntity } from '@user/entities/user.entity';

@Module({
	controllers: [ChatController],
	providers: [
		ChatService,
		UserService
	],
	imports: [
		ConfigModule,
		TypeOrmModule.forFeature([
			ChatEntity,
			MessageEntity,
			UserEntity
		])
	]
})
export class ChatModule {}
