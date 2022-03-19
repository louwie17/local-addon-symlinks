import os from 'os';

const unslashit = ( str: string ) => {
	if (typeof str !== 'string') {
		return str;
	}

	return str.replace(/\/+$/, '').replace(/\\+$/, '');
};

export const formatHomePath = (path: string, untrailingslashit = true) => {
	if (typeof path !== 'string') {
		return path;
	}

	const homedir = os.homedir();

	let output = path.replace(/^~\//, `${homedir}/`).replace(/^~\\/, `${homedir}\\`);

	if (untrailingslashit) {
		output = unslashit(output);
	}

	return output;
};