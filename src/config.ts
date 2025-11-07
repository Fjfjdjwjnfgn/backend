import 'dotenv/config';

const varsToCheck = [
	'DB_FILE_NAME',
	'PORT',
	'AUTH_NAME',
	'AUTH_PASSSWORD',
	'BASE_PATH',
];

const missingVars = varsToCheck.filter(props => !(props in process.env));
if(missingVars.length) {
	throw new Error('add next variables to .env file: ' + missingVars);
}

export const getDBFilename = () => process.env.DB_FILE_NAME!;

export const getPort = () => process.env.PORT!;

export const getAuthName = () => process.env.AUTH_NAME!;

export const getAuthPassword = () => process.env.AUTH_PASSSWORD!;

export const getBasePath = () => process.env.BASE_PATH!;