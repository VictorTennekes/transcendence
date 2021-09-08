import { Module, Session } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@user/user.module';
import { FortyTwoStrategy } from './42auth.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginGuard } from './login.guard';
import { SessionSerializer } from './session.serializer';
import { TwoFactorAuthenticationController } from './two-factor-authentication.controller';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

@Module({
	imports: [
		UserModule,
		ConfigModule
	],
	controllers: [
		AuthController,
		TwoFactorAuthenticationController
	],
	providers: [
		TwoFactorAuthenticationService,
		SessionSerializer,
		AuthService,
		FortyTwoStrategy,
		ConfigService,
		LoginGuard
	],
})
export class AuthModule { }
