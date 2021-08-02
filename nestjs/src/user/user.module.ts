import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
	controllers: [UserController],
	imports: [
		ConfigModule,
		TypeOrmModule.forFeature([UserEntity]),
	],
	providers: [UserService],
	exports: [UserService]
})
export class UserModule {}
