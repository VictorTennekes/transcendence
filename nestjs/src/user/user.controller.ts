import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe, Req, Query, Logger, UseInterceptors, Options, Header, Redirect, Res, UseFilters, UploadedFile } from '@nestjs/common';
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
import { Express } from 'express';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from './filters/image-file.filter';
import { editFileName } from './filters/edit-file-name.middleware';
import { diskStorage } from 'multer';
import { join } from 'path';
import { unlink } from 'fs';
import { UserEntity } from './entities/user.entity';

const fs = require('fs');
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink);

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
		const user = await this.userService.findOne(request.session.passport.user.login);
		return user;
	}

	@Get('stats/:id')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async getStatsOfUser(@Req() request, @Param('id') user: string) {
		return this.userService.getStatsOfUser(user);
	}

	@Post('get')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async getUser(@Req() request, @Body() body: any) {
		return this.userService.findOne(body.login);
	}

	@Post('get_multiple')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async getUsers(@Req() request, @Body() body: any) {
		let users: UserEntity[] = [];
		for (const login of body.logins) {
			users.push(await this.userService.findOne(login));
		}
		return users;
	}

	//TODO: add guard to prevent anything other than images to be uploaded
	//https://gabrieltanner.org/blog/nestjs-file-uploading-using-multer
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	@UseInterceptors(FileInterceptor('avatar', {
		storage: diskStorage({
			destination: 'assets',
			filename: editFileName,
		}),
		fileFilter: imageFileFilter
	}))
	@Post('image_upload')
	async imageUpload(@Req() request, @UploadedFile() avatar: Express.Multer.File) {
		let previousAvatar: string | null = null;

		const response = {
			originalname: avatar.originalname,
			filename: avatar.filename,
		};
		const user = await this.fetch_current(request);
		if (user.avatar_url)
			previousAvatar = user.avatar_url;
		await this.userService.update(request.session.passport.user.login, {avatar_url: avatar.filename});
		if (previousAvatar && previousAvatar != avatar.filename) {
			const filepath = join('assets', previousAvatar);
			unlinkAsync(filepath);
		}
		return response;
	}

	@Get('blocked/:id')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async isBlockedByUser(@Req() request, @Param('id') user: string) {
		return this.userService.isBlockedByUser(request.session.passport.user.login, user);
	}

	@Get('friend/:id')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async isFriendedByUser(@Req() request, @Param('id') user: string) {
		return this.userService.isFriendedByUser(request.session.passport.user.login, user);
	}

	@Get('friends')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async friendsOfUser(@Req() request, @Param('id') user: string) {
		return await this.userService.getFriends(request.session.passport.user.login);
	}

	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	@Get('image_delete')
	async imageDelete(@Req() request)
	{
		const user = await this.userService.findOne(request.session.passport.user.login);
		if (user.avatar_url) {
			const filepath = join('assets', user.avatar_url);
			unlinkAsync(filepath);
		}
		await this.userService.update(request.session.passport.user.login, {avatar_url: null});
	}


	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	@Post('check_display_name')
	async check_display_name(@Req() request, @Body() display_name: any) {
		return await this.userService.checkDisplayName(request.user.display_name, display_name.display_name);
	}

	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	@Post('update_display_name')
	async update_display_name(@Req() request, @Body() display_name: string) {
		await this.userService.update(request.session.passport.user.login, display_name);
	}

	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	@Post('update_two_factor')
	async update_two_factor(@Req() request, @Body() two_factor_enabled: string) {
		await this.userService.update(request.session.passport.user.login, two_factor_enabled);
	}

	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	@Get('user_exists/:username')
	async userExists(@Param("username") username: string) {
		if (await this.userService.findOne(username)) {
			return true;
		} else {
			return false;
		}
	}

	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	@Post('block_user')
	async blockUser(@Req() request, @Body() username: any) {
		if (request.user.login === username.username)
			return ;
		await this.userService.blockUser(request.session.passport.user.login, username.username);
	}

	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	@Post('add_friend')
	async addFriend(@Req() request, @Body() username: any) {
		if (request.user.login === username.username)
			return ;
		await this.userService.addFriend(request.session.passport.user.login, username.username);
	}

	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	@Post('unfriend')
	async unfriend(@Req() request, @Body() username: any) {
		if (request.user.login === username.username)
			return ;
		await this.userService.unfriend(request.session.passport.user.login, username.username);
	}

	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	@Get('get_friends/:username')
	async getFriends(@Param("username") username: string, @Req() request): Promise<UserDTO[]> {
		return await this.userService.getFriends(request.session.passport.user.login);
	}

	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	@Get('get_blocked_by_users')
	async getBlockedByUsers(@Req() request): Promise<UserDTO[]> {
		return await this.userService.getBlockedByUsers(request.session.passport.user.login);
	}

	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	@Post('unblock_user')
	async unblockUser(@Req() request, @Body() username: any) {
		if (request.user.login === username.username)
			return ;
		await this.userService.unblockUser(request.session.passport.user.login, username.username);
	}

	@Post('login')
//	@UsePipes(new ValidationPipe())
	async login(@Body() loginDetails: LoginUserDto)
	{
		return await this.userService.login(loginDetails);
	}

	@Get()
	async getCurrentUser(@Req() req): Promise<UserDTO> {
		return (req.session.passport.user);
	}
}
