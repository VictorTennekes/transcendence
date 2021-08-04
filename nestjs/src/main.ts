import { NestFactory } from '@nestjs/core';
import { ConnectionOptions } from 'tls';
import { AppModule } from './app.module';
import { getDbConnectionOptions, runDbMigrations } from './shared/utils';
import * as passport from 'passport';
import * as session from 'express-session';

import 'dotenv/config';

const postgresConnection = 
{
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	host: process.env.POSTGRES_HOST,
	port: process.env.POSTGRES_PORT,
	database: process.env.POSTGRES_DB
};

const postgresSession = require('connect-pg-simple')(session);

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	//initialize and use the session middleware, providing 'connect-pg-simple' as store
	app.use(session({
		cookie: {
			maxAge: 24 * 7 * 60 * 60 * 1000 // 1 week,
		},
		rolling: true, //reset the maxAge of the cookie on every response
		secret: 'fixme',
		store: new postgresSession({
			tableName: 'session',
			conObject: postgresConnection
		}),
		saveUninitialized: true,
		resave: true,
	}));

	//initialize passport to use SessionSerializer and save it into 'request.session'
	app.use(passport.initialize());
	app.use(passport.session());

	//integrate changes to the structure of entities into the database
	await runDbMigrations();
	await app.listen(3000);
}

bootstrap();
