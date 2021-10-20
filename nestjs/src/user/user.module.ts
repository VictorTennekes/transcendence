import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { SessionEntity } from './entities/session.entity';

@Module({
	controllers: [UserController],
	imports: [
		ConfigModule,
		//Makes the UserEntity Repository available in the current scope.
		TypeOrmModule.forFeature([
			UserEntity,
			SessionEntity
		]),
	],
	providers: [UserService],
	exports: [UserService] //if we need to use UserService outside of the UserModule (which we do, in AuthService)
})
export class UserModule {}
