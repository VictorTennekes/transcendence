import { DynamicModule, Module, Session } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAuthModuleOptions, PassportModule } from '@nestjs/passport';
import { UserModule } from '@user/user.module';
import { UserService } from '@user/user.service';
import { FortyTwoStrategy } from './42auth.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionSerializer } from './session.serializer';

export interface AuthModuleOptions extends IAuthModuleOptions {
	successRedirect: string,
	failureRedirect: string
}

@Module({
	imports: [
		UserModule,
		PassportModule.register({
			defaultStrategy: '42',
			property: 'user',
			session: true,
			successRedirect: '/auth/redirect_success',
			failureRedirect: '/auth/redirect_failure'
		})
	],
	controllers: [
		AuthController
	],
	providers: [
		AuthService,
		FortyTwoStrategy,
		ConfigService,
		SessionSerializer
	],
	exports : [
		PassportModule,
		AuthService,
		FortyTwoStrategy,
		SessionSerializer
	]
})
export class AuthModule {
	static register({
		successRedirect,
		failureRedirect,
	}: AuthModuleOptions): DynamicModule {
		return {
			module: AuthModule,
			imports: [
				PassportModule.register({
					session: true,
					successRedirect,
					failureRedirect,
				})
			],
			providers: [
				AuthService,
				FortyTwoStrategy,
				SessionSerializer
			],
			controllers: [
				AuthController
			],
			exports: [
				PassportModule,
				AuthService,
				FortyTwoStrategy,
				SessionSerializer
			]
		}
	}
}
