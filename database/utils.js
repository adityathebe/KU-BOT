const connection = require('./init');

const get_classes_of_teacher = (teacher_id) => {
    return new Promise((resolve, reject) => {
        let q = `SELECT code FROM classrooms WHERE teacher_id = '${teacher_id}';`;
        connection.query(q, (error, results, fields) => {
            if (error) reject(error);
            else {
                let classes = results.map(cl => cl.code);
                resolve(classes);
            }
        });
    });
};

const get_classes_of_student = (student_id) => {
    return new Promise((resolve, reject) => {
        let q = `SELECT class_code FROM class_student WHERE student_id = '${student_id}';`;
        connection.query(q, (error, results, fields) => {
            let classes = results.map(c => c.class_code);
            if (error) reject(error);
            else resolve(classes);
        });
    });
};

const get_students_of_class = (class_code) => {
    return new Promise((resolve, reject) => {
        let q = `SELECT student_id FROM class_student WHERE class_code = '${class_code}';`;
        connection.query(q, (error, results, fields) => {
            let students = results.map(s => s.student_id);
            if (error) reject(error);
            else resolve(students);
        });
    });
};

const get_teachers_of_class = (class_code) => {
    return new Promise((resolve, reject) => {
        let q = `SELECT teacher_id FROM classrooms WHERE code = '${class_code}';`;
        connection.query(q, (error, results, fields) => {
            if (error) reject(error);
            else {
                resolve(results);
            }
        });
    });
};

const getNewsRegisteredUser = () => {
    return new Promise((resolve, reject) => {
        let q = `SELECT * from students`
    })
}

module.exports = {
    get_classes_of_teacher,
    get_students_of_class,
    get_classes_of_student,
    get_teachers_of_class
};