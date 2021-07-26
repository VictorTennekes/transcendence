import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { comparePasswords, toPromise } from 'src/shared/utils';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDTO } from './dto/user.dto';
import { UserEntity } from './entities/user.entity';
import { LoginStatus } from './interfaces/login-status.interface';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>
	) {}

	//needs to be async to call 'await' on instructions
	// Prenk
	async create(createUserDto: CreateUserDto): Promise<UserDTO> {
		const {intra_name, password} = createUserDto;
		const display_name = intra_name;
		const user: UserEntity = this.userRepository.create({ intra_name, password, display_name,});
		await this.userRepository.save(user);
		return (toPromise<UserDTO>(user as UserDTO));
	}

	findAll() {
		return `This action returns all user`;
	}
	
	findOne(id: number) {
		return `This action returns a #${id} user`;
	}
	
	update(id: number, updateUserDto: UpdateUserDto) {
		return `This action updates a #${id} user`;
	}
	
	remove(id: number) {
		return `This action removes a #${id} user`;
	}

	async login(loginInformation: LoginUserDto): Promise<LoginStatus> {
		const intra_name = loginInformation.intra_name;
		const user: UserEntity = await this.userRepository.findOne({ where: { intra_name, }});
		
		let status: LoginStatus = {
			succes: true,
			code: 'OK'
		};

		// const passwordMatch: Boolean = await comparePasswords(loginInformation.password, user.password);
		if (!user || user.password != loginInformation.password)
			throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);

		return (toPromise<LoginStatus>(status));
	}
}
