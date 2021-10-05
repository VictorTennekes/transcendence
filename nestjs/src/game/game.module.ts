import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@user/user.module';
import { GameEntity } from './entity/game.entity';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
	providers: [
		GameService,
		GameGateway,
	],
	imports: [
		TypeOrmModule.forFeature([GameEntity]),
		UserModule
	],
	exports: [GameService]
})
export class GameModule {}
