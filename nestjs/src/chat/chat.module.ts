import { Module } from '@nestjs/common';
import { ChatController } from '@chat/chat.controller';
import { ChatService } from '@chat/chat.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from '@chat/entity/chat.entity';
import { MessageEntity } from './entity/message.entity';
import { UserService } from '@user/user.service';
import { UserEntity } from '@user/entities/user.entity';
import { ChatGateway } from './chat.gateway';
import { BanEntity } from './entity/ban.entity';
import { AuthModule } from 'src/auth/auth.module';
import { SessionEntity } from '@user/entities/session.entity';

@Module({
	controllers: [ChatController],
	providers: [
		ChatService,
		UserService,
		ChatGateway,
	],
	imports: [
		AuthModule,
		ConfigModule,
		TypeOrmModule.forFeature([
			ChatEntity,
			MessageEntity,
			UserEntity,
			BanEntity,
			SessionEntity
		])
	]
})
export class ChatModule {}
