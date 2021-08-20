import { Module, Session } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@user/user.module';
import { FortyTwoStrategy } from './42auth.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionEntity } from './entity/session.entity';
import { LoginGuard } from './login.guard';
import { SessionSerializer } from './session.serializer';

@Module({
	imports: [
		TypeOrmModule.forFeature([SessionEntity]),
		UserModule,
		ConfigModule
	],
	controllers: [
		AuthController
	],
	providers: [
		SessionSerializer,
		AuthService,
		FortyTwoStrategy,
		ConfigService,
		LoginGuard
	],
})
export class AuthModule { }
