import { Module } from '@nestjs/common';
import { MatchGateway } from './match.gateway';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { UserService } from '@user/user.service';
import { UserModule } from '@user/user.module';
import { GameModule } from 'src/game/game.module';
import { GameService } from 'src/game/game.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	providers: [MatchGateway, MatchService],
	imports: [UserModule, GameModule],
	controllers: [MatchController],
})
export class MatchModule {}
