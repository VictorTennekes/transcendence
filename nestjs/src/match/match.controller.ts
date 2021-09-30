import { Controller, Get, Post, UseGuards, UseFilters, Req, Param, Logger } from '@nestjs/common';
import { No2FAGuard } from 'src/auth/no-2fa.guard';
import { UnauthorizedFilter } from 'src/auth/unauthorized.filter';
import { request } from 'http';
import { MatchService } from './match.service';
import { MatchSettings } from './match.class';
import { GameService } from 'src/game/game.service';

@Controller('match')
export class MatchController {
	constructor(
		private readonly matchService: MatchService,
		private readonly gameService: GameService
	) {

	}

	@Post('create_private')
	@UseGuards(No2FAGuard)
	@UseFilters(UnauthorizedFilter)
	createPrivateMatch(@Req() request, settings: MatchSettings) {
		const id = this.matchService.createMatch(request.user.intra_name, settings, true);
		return (id);
	}

	@Get('ongoing/:id')
	@UseGuards(No2FAGuard)
	@UseFilters(UnauthorizedFilter)
	matchOngoing(@Req() request, @Param('id') id: string) {
		Logger.log(`MATCHONGOING - ${id}`);
		const game = this.gameService.games[id];
		Logger.log(`${!!game}`);
		return (!!game);
	}

	@Get('accepted/:id')
	@UseGuards(No2FAGuard)
	@UseFilters(UnauthorizedFilter)
	matchAccepted(@Req() request, @Param('id') id: string) {
		return this.matchService.isAccepted(id);
	}

}
