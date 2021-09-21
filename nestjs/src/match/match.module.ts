import { Module } from '@nestjs/common';
import { MatchGateway } from './match.gateway';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';

@Module({
  providers: [MatchGateway, MatchService],
  controllers: [MatchController]
})
export class MatchModule {}
