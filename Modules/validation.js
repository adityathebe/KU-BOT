// Database Models
const TeacherModel = require('../models/teacher');
const StudentModel = require('../models/student');
const ClassModel = require('../models/classroom');

function validate_teacher (profile_id) {

	return new Promise((resolve, reject) => {

		let params = {
			profileID: profile_id
		}

		TeacherModel.find(params, (err, teachers) => {

			if (err) reject(err)

			if (teachers.length > 0) {
				resolve(teachers)
			} else {
				reject('Not found')
			}
		});
	});
}

function validate_class (subscription_code) {
	subscription_code = subscription_code.toUpperCase();

	return new Promise((resolve, reject) => {

		TeacherModel.find({}, (err, teachers) => {
			if (err) reject(err);

			let classes_multi = teachers.map((teacher) => {
				return teacher.classes;
			});

			let classes = [];
			classes_multi.forEach((classs) => {
				classes = classes.concat(classs);
			});

			if (classes.indexOf(subscription_code) >= 0) {
				resolve(true)
			} else {
				reject(false);
			}
		});
	});
}

function get_students_of_class (class_code) {
	return new Promise((resolve, reject) => {
		StudentModel.find({}, (err, students) => {
			if (err) reject(err);

			let found_students = students.filter((student) => {
				if (student.subscribed_to.indexOf(class_code) >= 0 )
					return true;
				return false;
			})

			resolve(found_students)
		})
	})
}

function get_classes_of_teacher (teacher_id) {
	return new Promise((resolve, reject) => {
		TeacherModel.findOne({profileID: teacher_id}, (err, teacher) => {
			if (err)
			if (teacher)
				resolve(teacher.classes)
			else
				reject('No teacher found');
		});
	});
}

module.exports = {
	validate_teacher,
	validate_class,
	get_students_of_class,
	get_classes_of_teacher
}