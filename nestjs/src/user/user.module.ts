import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy as FortyTwoStrategy } from './42auth.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
	controllers: [UserController],
	imports: [
		ConfigModule,
		TypeOrmModule.forFeature([UserEntity]),
		PassportModule.register({
			defaultStrategy: '42',
			property: 'user',
			session: true,
		}),
	],
	providers: [UserService, FortyTwoStrategy]
})
export class UserModule {}
