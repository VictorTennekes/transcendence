import { NestFactory } from '@nestjs/core';
import { ConnectionOptions } from 'tls';
import { AppModule } from './app.module';
import { getDbConnectionOptions, runDbMigrations } from './shared/utils';

async function bootstrap() {
	const app = await NestFactory.create(AppModule.forRoot(await getDbConnectionOptions()));
	await runDbMigrations();
	await app.listen(3000);
}

bootstrap();
