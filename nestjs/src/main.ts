import { NestFactory } from '@nestjs/core';
import passport from 'passport';
import { ConnectionOptions } from 'tls';
import { AppModule } from './app.module';
import { getDbConnectionOptions, runDbMigrations } from './shared/utils';

async function bootstrap() {
	const app = await NestFactory.create(AppModule.forRoot(await getDbConnectionOptions()));
	// app.use((req, res, next) => {
		// 	res.header('Access-Control-Allow-Origin', '*');
		// 	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		// 	res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
		// 	next();
		//   });
	app.enableCors( {
		credentials: true,
		origin: ['http://localhost:4200', 'https://signin.intra.42.fr'],
		optionsSuccessStatus: 200
	});
	await runDbMigrations();
	await app.listen(3000);
}

bootstrap();
