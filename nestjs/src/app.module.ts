import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionOptions } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

@Module({
	controllers: [ AppController ],
	providers: [ AppService ]
})
export class AppModule {
	static forRoot(connOptions: ConnectionOptions): DynamicModule {
		return {
			module: AppModule,
			imports: [
				UserModule,
				TypeOrmModule.forRoot(connOptions)],
		};
	}
}
