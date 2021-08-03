import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getDbConnectionOptions, runDbMigrations } from './shared/utils';
import * as passport from 'passport';

passport.serializeUser((user, done) => {
	console.log("SERIALIZING");
	done(null, user);
});

passport.deserializeUser((user, done) => {
	console.log("DESERIALIZING");
	done(null, user);
});

import 'dotenv/config';

const postgresConnection = 
{
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	host: process.env.POSTGRES_HOST,
	port: process.env.POSTGRES_PORT,
	database: process.env.POSTGRES_DB
};

var pg = require('pg')
, session = require('express-session')
, pgSession = require('connect-pg-simple')(session);

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// app.use(
	// 	session({
	// 		secret: 'fixme',
	// 		resave: false,
	// 		saveUninitialized: false
	// 	})
	// );
	app.use(session({
		cookie: {
			maxAge: 24 * 7 * 60 * 60 * 1000 // 1 week,
		},
		rolling: true, //reset the maxAge of the cookie on every response, keep-alive sort of way
		secret: 'fixme',
		store: new pgSession({
			tableName: 'session',
			conObject: postgresConnection
		}),
		saveUninitialized: true,
		resave: true,
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	await runDbMigrations();
	await app.listen(3000);
}

bootstrap();
