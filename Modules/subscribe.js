// Database Models
const TeacherModel = require('../models/teacher');
const StudentModel = require('../models/student');

const { getUserData } = require('../Modules/apicalls');


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

function add_class_of_teacher (teacher_id, class_code) {
    
}

module.exports = {
    subscribeStudent,
    registerTeacher
}