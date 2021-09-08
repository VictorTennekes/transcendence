import { extname } from "path";

export const editFileName = (req, file, callback) => {
	const name = req.session.passport.user.login;
	const fileExtName = extname(file.originalname);
	callback(null, `${name}${fileExtName}`);
};
