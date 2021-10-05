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
		Logger.log(`USER: ${request.session.passport.user.login}`);
		const user = await this.userService.findOne(request.session.passport.user.login);
		Logger.log(`FETCH_CURRENT - USER: ${user}`);
		return user;
	}

	@Post('get')
	@UseGuards(AuthenticatedGuard)
	@UseFilters(UnauthorizedFilter)
	async getUser(@Req() request, @Body() body: any) {
		Logger.log(`GET USER - ${JSON.stringify(body)}`);
		return this.userService.findOne(body.login);
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
			Logger.log(`USER EXISTS`);
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



	@Post('login')
//	@UsePipes(new ValidationPipe())
	async login(@Body() loginDetails: LoginUserDto)
	{
		return await this.userService.login(loginDetails);
	}

	@Get()
	async getCurrentUser(@Req() req): Promise<UserDTO> {
		Logger.log("user is:");
		Logger.log(JSON.stringify(req.session.passport.user));
		return (req.session.passport.user);
	}
}
