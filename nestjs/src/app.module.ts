import { DynamicModule, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionOptions } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { Passport } from 'passport';

@Module({
	controllers: [ AppController, AuthController ],
	providers: [ AppService, AuthService ],
	imports: [AuthModule]
})
export class AppModule {
	static forRoot(connOptions: ConnectionOptions): DynamicModule {
		return {
			module: AppModule,
			imports: [
				UserModule,
				TypeOrmModule.forRoot(connOptions),
			],
		};
	}

	configure (consumer: MiddlewareConsumer) {
		consumer.apply(Passport);
	}

	// configure(consumer: MiddlewareConsumer) {
	// 	consumer
	// 	.apply(CorsMiddleware)
	// 	.forRoutes({ path: '*', method: RequestMethod.ALL});
	// }
}
