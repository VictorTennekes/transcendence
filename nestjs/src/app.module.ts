import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionOptions } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	controllers: [ AppController ],
	providers: [ AppService ]
})
export class AppModule {
	static forRoot(connOptions: ConnectionOptions): DynamicModule {
		return {
			module: AppModule,
			imports: [
				TypeOrmModule.forRoot(connOptions)],
		};
	}
}
