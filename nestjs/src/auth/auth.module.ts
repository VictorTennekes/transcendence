import { Module, Session } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '@user/user.module';
import { FortyTwoStrategy } from './42auth.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginGuard } from './login.guard';
import { SessionSerializer } from './session.serializer';

@Module({
	imports: [
		UserModule,
		ConfigModule
	],
	controllers: [
		AuthController
	],
	providers: [
		AuthService,
		FortyTwoStrategy,
		ConfigService,
		SessionSerializer,
		LoginGuard
	],
})
export class AuthModule { }
