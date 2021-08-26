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
//		return ({display_name: "HELLO"});
		console.log(JSON.stringify(request.session));
		console.log(`fetch_current: passport: ${JSON.stringify(request.session.passport.user.intra_name)}`);
		const user = await this.userService.findOne(request.session.passport.user.intra_name);
		console.log(`${JSON.stringify(user)}`);
		return user;
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
		console.log(`FILE: ${avatar}`);
		let previousAvatar: string | null = null;

		const response = {
			originalname: avatar.originalname,
			filename: avatar.filename,
		};
		const user = await this.fetch_current(request);
		if (user.avatar_url)
			previousAvatar = user.avatar_url;
		await this.userService.update(request.session.passport.user.intra_name, {avatar_url: avatar.filename});
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
		const user = await this.userService.findOne(request.session.passport.user.intra_name);
		if (user.avatar_url) {
			const filepath = join('assets', user.avatar_url);
			unlinkAsync(filepath);
		}
		await this.userService.update(request.session.passport.user.intra_name, {avatar_url: null});
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
