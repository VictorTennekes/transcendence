import { Module } from '@nestjs/common';
import { MatchGateway } from './match.gateway';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { UserService } from '@user/user.service';
import { UserModule } from '@user/user.module';

@Module({
  providers: [MatchGateway, MatchService],
  imports: [UserModule],
  controllers: [MatchController]
})
export class MatchModule {}
