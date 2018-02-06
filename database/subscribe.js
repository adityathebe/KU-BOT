const addNewStudent = (connection, student) => {
    return new Promise((resolve, reject) => {
        let q = "INSERT INTO students (profile_id, name, cd) VALUES";
            q += `(${student.id}, ${student.name}, ${student.cr})`;
        connection.query(q, (error, results, fields) => {
            if (error) reject(error);
            else resolve(results, fields);
        });
    })
}

const addNewTeacher = (connection, teacher) => {
    return new Promise((resolve, reject) => {
        let q = "CREATE TABLE teacheres (profile_id varchar(100), name varchar(255)";
        connection.query(q, (error, results, fields) => {
            if (error) reject(error);
            else resolve(results, fields);
        });
    })
}

const addNewClass = (connection, classroom) => {
    return new Promise((resolve, reject) => {
        let q = "CREATE TABLE classrooms (id int auto_increment, code varchar(100), teacher_id varchar(255) "
            q += "foreign key (teacher_id) references teachers (profile_id)";
            q += "on delete cascase on update cascade"
        connection.query(q, (error, results, fields) => {
            if (error) reject(error);
            else resolve(results, fields);
        });
    })
}

module.exports = {
    addNewStudent,
    addNewTeacher,
    addNewClass
}