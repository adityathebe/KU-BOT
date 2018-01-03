// Database Models
const TeacherModel = require('../models/teacher');
const StudentModel = require('../models/student');
const ClassModel = require('../models/classroom');

const { getUserData } = require('../Modules/apicalls');
const { validate_class } = require('../Modules/validation');

function subscribeStudent (sender, subscription_code) {

    return new Promise ((resolve, reject) => {
        let student = new StudentModel();
        student.profileID = sender;
        student.cr = false;

        // Fetch the list of all students
        StudentModel.find({}, (err, students) => {

            if (err) reject("Database Error" + err)

            let studentList = students.filter((stu) => {
                return stu.profileID === student.profileID
            });

            if (studentList.length > 0) {
                // Update database
                let updatedData = {
                    "$push" : {
                        subscribed_to: subscription_code
                    }
                };

                StudentModel.update({profileID: student.profileID}, updatedData, (err) => {
                    if (err) reject(err)
                    else resolve("Student data updated!");
                });
            } else {
                // save
                student.subscribed_to = subscription_code;
                getUserData(sender, (name) => {
                    student.name = name;
                    student.save( (err) => {
                        if (err) reject(err)
                        else resolve('New Student saved!');
                    });
                });
            }
        });
    })

}

function registerTeacher (profile_id ) {
    return new Promise((resolve, reject) => {

        let teacher = new TeacherModel();
        teacher.profileID = profile_id;
        // teacher.classes = ['MATH', 'CHEM', 'PHY'];

        // Fetch the list of all students
        TeacherModel.findOne({profileID: profile_id}, (err, teachers) => {

            if (err) reject("Sorry try again. Database error")

            if (teachers) {
                reject('Teacher already registered');
            } else {
                // save
                getUserData(profile_id, (name) => {
                    teacher.name = name;
                    teacher.save( (err) => {
                        if (err) reject(err)
                        else resolve('New Teacher Registered!');
                    });
                });
            }
        });
    })   
}

function register_class (teacher_id, class_code) {

    return new Promise((resolve, reject) => {

        validate_class(class_code).then((msg) => {
            reject('Class code already taken!');
        })
        .catch((err) => {
            
            let updatedData = {
                "$push" : {
                    classes: class_code
                }
            };

            TeacherModel.update({profileID: teacher_id}, updatedData, (err) => {
                if (err) reject(err)
                else resolve("New class added!");
            });

            // Save in classroom
            let new_class = new ClassModel();
            new_class.code = class_code;
            new_class.teacher = teacher_id;
            new_class.save((err) => {
                if (err)
                    console.log('Error while adding new classrom')
                else
                    console.log('New classRoom Added')
            })
        });
    })
}

module.exports = {
    subscribeStudent,
    registerTeacher,
    register_class
}