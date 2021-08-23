import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from '@chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import 'dotenv/config';

@Module({
	controllers: [],
	providers: [],
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get('POSTGRES_HOST'),
				port: configService.get('POSTGRES_PORT'),
				username: configService.get('POSTGRES_USER'),
				password: configService.get('POSTGRES_PASSWORD'),
				database: configService.get('POSTGRES_DB'),
				autoLoadEntities: true,
				synchronize: true,
			}),
			inject: [ConfigService]
		}),
		ChatModule,
		AuthModule
	]
})
export class AppModule { }
