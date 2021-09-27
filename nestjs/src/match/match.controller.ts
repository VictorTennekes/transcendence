import { Controller, Get, Post, UseGuards, UseFilters, Req, Param, Logger } from '@nestjs/common';
import { MatchService, MatchSettings } from './match.service';
import { No2FAGuard } from 'src/auth/no-2fa.guard';
import { UnauthorizedFilter } from 'src/auth/unauthorized.filter';
import { request } from 'http';

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
	// @Post('find')
	// @UseGuards(No2FAGuard)
	// @UseFilters(UnauthorizedFilter)
	// findMatch(@Req() request, settings: MatchSettings) {
	// 	Logger.log(`API/MATCH/FIND called`);
	// 	const id = this.matchService.findMatch(request.user.intra_name, settings);
	// 	return id;
	// }

	@Get('accept/:id')
	@UseGuards(No2FAGuard)
	@UseFilters(UnauthorizedFilter)
	acceptMatch(@Req() request, @Param('id') id: string) {
		this.matchService.acceptMatch(id, request.user.intra_name);
	}

	@Get('cancel/:id')
	@UseGuards(No2FAGuard)
	@UseFilters(UnauthorizedFilter)
	cancelMatch(@Req() request, @Param('id') id: string) {
		this.matchService.cancelMatch(id);
	}

	@Get('accepted/:id')
	@UseGuards(No2FAGuard)
	@UseFilters(UnauthorizedFilter)
	matchAccepted(@Req() request, @Param('id') id: string) {
		return this.matchService.isAccepted(id);
	}

}
