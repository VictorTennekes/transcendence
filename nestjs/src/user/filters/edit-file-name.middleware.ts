import { extname } from "path";

export const editFileName = (req, file, callback) => {
	const name = req.session.passport.user.intra_name;
	const fileExtName = extname(file.originalname);
	callback(null, `${name}${fileExtName}`);
};
