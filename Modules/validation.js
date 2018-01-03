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
				resolve('Teacher')
			} else {
				resolve(false)
			}
		});
	});
}

function validate_CR (profile_id) {

	return new Promise((resolve, reject) => {

		let params = {
			profileID: profile_id
		}

		StudentModel.find(params, (err, CR) => {

			if (err) reject(err)

			if (CR.length > 0) {
				resolve('CR')
			} else {
				resolve(false)
			}
		});
	});
}

async function validate_teacher_CR (profile_id) {
	return new Promise((resolve, reject) => {
		validate_teacher(profile_id)
			.then((isTeacher) => {
				validate_CR(profile_id)
					.then((isCR) => {
						if (isTeacher)
							resolve('teacher')
						else if (isCR)
							resolve('cr')
						else
							resolve(false)

					})
			})
	})
}

function validate_class (subscription_code) {
	subscription_code = subscription_code.toUpperCase();

	get_all_classes()
		.then((classes) => {
			if (classes.indexOf(subscription_code)) {
				resolve(true)
			} else {
				reject(false);
			}
		})
		.catch((err) => console.log(err));
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
			if (err) reject(err);
			
			if (teacher)
				resolve(teacher.classes)
			else
				reject('No teacher found');
		});
	});
}

function get_classes_of_student (student_id) {
	return new Promise((resolve, reject) => {
		StudentModel.findOne({profileID: student_id}, (err, student) => {
			if (err) reject(err);
			
			if (student)
				resolve(student.subscribed_to)
			else
				reject(null);
		});
	});
}

function get_teachers_of_student (student_id) {
	return new Promise((resolve, reject) => {
		get_classes_of_student(student_id)
			.then((classes) => {
				get_all_teachers()
					.then((teachers) => {
						
					});
			})
			.catch(err => console.log(err);

		TeacherModel.findOne({profileID: teacher_id}, (err, teacher) => {
			if (err) reject(err);
			
			if (teacher)
				resolve(teacher.classes)
			else
				reject('No teacher found');
		});
	});
}

function get_all_classes () {
	return new Promise((resolve, reject) => {
		ClassModel.find({}, (err, classes) => {
			if (err) reject(err);
			resolve(classes);
		});
	});
}

function get_all_teachers () {
	return new Promise((resolve, reject) => {
		TeacherModel.find({}, (err, teachers) => {
			if (err) reject(err);
			resolve(teachers);
		});
	});
}

module.exports = {
	validate_teacher,
	validate_CR,
	validate_teacher_CR,
	validate_class,
	get_students_of_class,
	get_classes_of_teacher
}