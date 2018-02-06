const createStudentsTable = (connection) => {
    return new Promise((resolve, reject) => {
        let q = "CREATE TABLE students (profile_id varchar(100), name varchar(255), cr char, primary key(profile_id) );";
        connection.query(q, (error, results, fields) => {
            if (error) reject(error);
            else resolve(results, fields);
        });
    })
}

const createTeachersTable = (connection) => {
    return new Promise((resolve, reject) => {
        let q = "CREATE TABLE teachers (profile_id varchar(100), name varchar(255), primary key(profile_id) );";
        connection.query(q, (error, results, fields) => {
            if (error) reject(error.message);
            else resolve(results, fields);
        });
    })
}

const createClassTable = (connection) => {
    return new Promise((resolve, reject) => {
        let q = "CREATE TABLE classrooms ( code varchar(100), teacher_id varchar(100), "
        q += "foreign key (teacher_id) references teachers (profile_id)";
        q += "on delete cascade on update cascade);"
        connection.query(q, (error, results, fields) => {
            if (error) reject(error);
            else resolve(results, fields);
        });
    })
}

module.exports = {
    createStudentsTable,
    createTeachersTable,
    createClassTable
}