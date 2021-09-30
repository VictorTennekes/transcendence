import { NestFactory } from '@nestjs/core';
import { ConnectionOptions } from 'tls';
import { AppModule } from './app.module';
import { getDbConnectionOptions, runDbMigrations } from './shared/utils';
import * as passport from 'passport';
import * as session from 'express-session';
var morgan = require('morgan');

import 'dotenv/config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

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
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	//useful for debugging requests - used to see which url requests are made
	// app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req[Cookie]'));

	//serving static files (avatars)
	app.useStaticAssets(join(__dirname, '..', 'assets'), {
		index: false,
		prefix: '/assets',
	});

	const fs = require('fs');
	const path = require('path');
	
	await runDbMigrations();
	
	const knex = require('knex')({
		client: 'pg',
		connection: postgresConnection,
	});
	
	//create the 'session' table if it doesn't exist
	const sessionStore = await knex.schema.hasTable('session').then(exists => {
		if (exists) return;
		return new Promise((resolve, reject) => {
			const schemaFilePath = path.join('node_modules', 'connect-pg-simple', 'table.sql');
			fs.readFile(schemaFilePath, (error, contents) => {
				if (error) {
					return reject(error);
				}
				const sql = contents.toString();
				knex.raw(sql).then((query) => {
					resolve(query);
				}).catch(reject);
			});
		});
	}).then(() => {
		// Session table ready.
		return new postgresSession({
			conObject: postgresConnection,
		});
	});
	
	//initialize and use the session middleware, providing 'connect-pg-simple' as store
	app.use(session({
		cookie: {
			maxAge: 24 * 7 * 60 * 60 * 1000, // 1 week,
			httpOnly: false,
			secure: false,
			sameSite: 'strict'
		},
		rolling: true, //reset the maxAge of the cookie on every response
		secret: 'fixme', //FIXME change this
		store: sessionStore,
		saveUninitialized: false,
		resave: true,
	}));

	//initialize passport to use SessionSerializer and save it into 'request.session'
	app.use(passport.initialize());
	app.use(passport.session());

	await app.listen(3000);
}

bootstrap();
