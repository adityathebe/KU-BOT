const get_classes_of_teacher = (connection, teacher_id) => {
    return new Promise((resolve, reject) => {
        let q = `SELECT code FROM classrooms WHERE teacher = '${teacher_id}';`;
        connection.query(q, (error, results, fields) => {
            if (error) reject(error);
            else {
                let classes = results.map(cl => cl.code)
                resolve(classes);
            }
        });
    })
}

const get_students_of_class = (connection, teacher_id) => {
    return new Promise((resolve, reject) => {
        let q = `SELECT code FROM classrooms WHERE teacher = '${teacher_id}';`;
        connection.query(q, (error, results, fields) => {
            if (error) reject(error);
            else resolve(results);
        });
    })
}


module.exports = {
    get_classes_of_teacher,
    get_students_of_class,
}