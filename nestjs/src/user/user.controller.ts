import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe, Req, Request, Query, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDTO } from './dto/user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LocalStrategy } from './42auth.strategy';

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

	@Get()
	findAll() {
		return this.userService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.userService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.userService.update(+id, updateUserDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.userService.remove(+id);
	}

	@Post('login')
	async login(@Body() loginUserDto: LoginUserDto)
	{
		return await this.userService.login(loginUserDto);
	}

	//home/1234 <- parameter
	//home?code=1234 <- query
	@Get('home')
	async authAccepted(@Query('code') code: string) {
		// const payload = await this.authService.validate(code as "");
		void (code);
		Logger.log('accepted');
		return ("");
	}

	@Get('home')
	async authDenied(@Query('error') error: string, @Query('error_description') description: string) {
		Logger.log('rip');
		return ("");
	}

	@Get('home')
	defaultHome()
	{
		Logger.log('DEFAULT FALLBACK');
		return ("");
	}
}
