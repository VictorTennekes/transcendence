import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { UserEntity } from '@user/entities/user.entity';
import { UserService } from '@user/user.service';
import { toFileStream } from 'qrcode';

@Injectable()
export class TwoFactorAuthenticationService {
	constructor (
		private readonly userService: UserService,
		private readonly config: ConfigService
	) {}
	
	public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
		return toFileStream(stream, otpauthUrl);
	}
	
	public isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: UserEntity) {
		return authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret: user.two_factor_secret,
		})
	}

	public async generateTwoFactorAuthenticationSecret(user: UserEntity) {
		const secret = authenticator.generateSecret();
		await this.userService.setTwoFactorAuthenticationSecret(secret, user.intra_name);

		return (secret);
	}
	public async getTwoFactorAuthenticationURL(user: UserEntity) {
		let secret = user.two_factor_secret;
		if (!secret)
			secret = await this.generateTwoFactorAuthenticationSecret(user);
		const otpauthUrl = authenticator.keyuri(user.intra_name, this.config.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'), secret);
		
		return {
			secret,
			otpauthUrl
		}

	}
}
