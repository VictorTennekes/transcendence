import { Controller, Get, Post, UseGuards, UseFilters, Req } from '@nestjs/common';
import { MatchService } from './match.service';
import { No2FAGuard } from 'src/auth/no-2fa.guard';
import { UnauthorizedFilter } from 'src/auth/unauthorized.filter';

@Controller('match')
export class MatchController {
	constructor(
		private readonly matchService: MatchService
	) {

	}

	@Post()
	@UseGuards(No2FAGuard)
	@UseFilters(UnauthorizedFilter)
	createPrivateMatch(@Req() request) {
		const id = this.matchService.createMatch(request.user.intra_name, {}, true);
		return (id);
	}
}
