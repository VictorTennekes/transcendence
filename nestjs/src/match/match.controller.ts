import { Controller, Get, Post, UseGuards, UseFilters, Req } from '@nestjs/common';
import { MatchService, MatchSettings } from './match.service';
import { No2FAGuard } from 'src/auth/no-2fa.guard';
import { UnauthorizedFilter } from 'src/auth/unauthorized.filter';

@Controller('match')
export class MatchController {
	constructor(
		private readonly matchService: MatchService
	) {

	}

	@Post('create_private')
	@UseGuards(No2FAGuard)
	@UseFilters(UnauthorizedFilter)
	createPrivateMatch(@Req() request, settings: MatchSettings) {
		const id = this.matchService.createMatch(request.user.intra_name, settings, true);
		return (id);
	}

	//in the frontend start listening for events on this matchid
	//then as soon as the match finds an opponent, send an event
	@Post('find')
	@UseGuards(No2FAGuard)
	@UseFilters(UnauthorizedFilter)
	findMatch(@Req() request, settings: MatchSettings) {
		const id = this.matchService.findMatch(request.user.intra_name, settings);
		return id;
	}
}
