import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from '@chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import 'dotenv/config';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GameModule } from './game/game.module';
import { MatchModule } from './match/match.module';
import { GameEntity } from './game/entity/game.entity';

@Module({
	controllers: [],
	imports: [
		MulterModule.register({
			dest: 'assets',
		}),
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
				synchronize: true, //TODO: fix this, not for production
			}),
			inject: [ConfigService]
		}),
		ChatModule,
		AuthModule,
		GameModule,
		MatchModule
	]
})
export class AppModule { }
