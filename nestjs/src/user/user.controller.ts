import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe, Req, Query, Logger, UseInterceptors, Options, Header, Redirect, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDTO } from './dto/user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LocalStrategy } from './42auth.strategy';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly authService: LocalStrategy
	) {}
		
	@UsePipes(new ValidationPipe())
	@Post('register')
	register(@Body() createUserDto: CreateUserDto) {
		return this.userService.create(createUserDto);
	}
	
	@Get('home')
	@UseGuards(AuthGuard('42'))
	@Header('Content-Type', 'application/json')
	async auth(@Req() req: Request, @Res() res: Response): Promise<void> {
		console.log("user data:", req.user);
		if (!req.user) {
			res.redirect(`http://localhost:4200/home?loginstatus=failed`);
			return;
		}
		
		res.redirect(`http://localhost:4200/home?loginstatus=success`);
		return ;
	}
	@Post('login')
	async login(@Body() loginDetails: LoginUserDto)
	{
		console.log(loginDetails.intra_name);
		return await this.userService.login(loginDetails);
	}
}
