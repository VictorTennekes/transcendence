import { Controller, Get, Post, UseGuards, UseFilters, Req, Param, Logger } from '@nestjs/common';
import { No2FAGuard } from 'src/auth/no-2fa.guard';
import { UnauthorizedFilter } from 'src/auth/unauthorized.filter';
import { request } from 'http';
import { MatchService } from './match.service';
import { MatchSettings } from './match.class';
import { GameService } from 'src/game/game.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { MatchGateway } from './match.gateway';

@Controller('match')
export class MatchController {
	constructor(
		private readonly matchService: MatchService,
		private readonly gameService: GameService,
		private readonly matchGateway: MatchGateway
	) {

	}

	@Get('history/:id')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async historyOfUser(@Req() request, @Param('id') id: string) {
		Logger.log(`MATCH CONTROLLER - HISTORY OF USER ${id}`);
		return this.gameService.getHistoryOfUser(id);
		// const result = await this.gameService.gameFinished(id);
		// Logger.log(result);
		// return result;
	}

	@Get('finished/:id')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async matchFinished(@Req() request, @Param('id') id: string) {
		const result = await this.gameService.gameFinished(id);
		return result;
	}

	@Get('/:id')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	getMatch(@Req() request, @Param('id') id: string) {
		return this.gameService.get(id);
	}

	@Get('online/:id')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	getOnlineStatus(@Req() request, @Param('id') user: string) {
		return !!this.matchGateway.isOnline(user);
	}

	@Get('ongoing/:id')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	matchOngoing(@Req() request, @Param('id') id: string) {
		return (id in this.gameService.games);
	}

	@Get('accepted/:id')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	matchAccepted(@Req() request, @Param('id') id: string) {
		return this.matchService.isAccepted(id);
	}

}
