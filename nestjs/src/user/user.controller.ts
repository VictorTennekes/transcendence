import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe, Req, Query, Logger, UseInterceptors, Options, Header, Redirect, Res, UseFilters } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDTO } from './dto/user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { UnauthorizedFilter } from 'src/auth/unauthorized.filter';
import { request } from 'http';

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
	) {}
		
	// @UsePipes(new ValidationPipe())
	// @Post('register')
	// register(@Body() createUserDto: CreateUserDto) {
	// 	return this.userService.create(createUserDto);
	// }

	@Get('fetch_current')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async fetch_current(@Req() request)
	{
//		return ({display_name: "HELLO"});
		console.log(JSON.stringify(request.session));
		console.log(`fetch_current: passport: ${JSON.stringify(request.session.passport.user.intra_name)}`);
		const user = await this.userService.findOne(request.session.passport.user.intra_name);
		console.log(`${JSON.stringify(user)}`);
		return user;
	}

	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	@Post('update_display_name')
	async update_display_name(@Req() request, @Body() display_name: string) {
		console.log(`body: ${JSON.stringify(display_name)}`);
		await this.userService.update(request.session.passport.user.intra_name, display_name);
	}

	@Post('login')
//	@UsePipes(new ValidationPipe())
	async login(@Body() loginDetails: LoginUserDto)
	{
		console.log(loginDetails.intra_name);
		return await this.userService.login(loginDetails);
	}
}
