const connection = require('./init');

const validate_teacher = (profile_id) => {
	return new Promise((resolve, reject) => {
		let q = `SELECT * FROM teachers WHERE profile_id = '${profile_id}';`;
		connection.query(q, (error, results, fields) => {
			if (error) reject(error.message);
			else {
				if (results)
					resolve(true)
				else
					resolve(false);
			}
		});
	});
}

const validate_cr = (profile_id) => {
	return new Promise((resolve, reject) => {
		let q = `SELECT * FROM students WHERE cr = 'T' and profile_id = '${profile_id}';`;
		connection.query(q, (error, results, fields) => {
			if (error) reject(error.message);
			else {
				if (results)
					resolve(true)
				else
					resolve(false);
			}
		});
	});
}

const validate_teacher_cr = (profile_id) => {
	return new Promise((resolve, reject) => {
		validate_cr(profile_id)
			.then((result) => {
				if (result) resolve('cr')
				else return validate_teacher(profile_id)
			})
			.then((result) => {
				if (result) resolve('teacher')
				else return null
			})
			.catch(err => reject(err));
	});
}

const validate_class = (class_code) => {
	return new Promise((resolve, reject) => {
		let q = `SELECT count(*) as count FROM classrooms WHERE code = '${class_code}';`;
		connection.query(q, (error, results, fields) => {
			if (error) reject(error);
			else {
				let res = results.count == 0;
				resolve(res);
			}
		});
	});
}

module.exports = {
	validate_teacher,
	validate_cr,
	validate_teacher_cr,
	validate_class
}