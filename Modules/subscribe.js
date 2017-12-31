
function subscribeStudent (sender, subscription) {

    let student = new StudentModel();
    student.profileID = sender;
    student.cr = false;

    // Fetch the list of all students
    StudentModel.find({}, (err, students) => {

        let studentList = students.filter((stu) => {
            return stu.profileID === student.profileID
        });

        if (studentList.length > 0) {
            // Update database
            let updatedData = {
                "$push" : {
                    subscribed_to: subscription
                }
            };

            StudentModel.update({profileID: student.profileID}, updatedData, (err) => {
                if (err) console.log(err)
                else console.log("Student data updated!");
            });
        } else {
            // save
            student.subscribed_to = subscription;
            getUserData(sender, (name) => {
                student.name = name;
                student.save( (err) => {
                    if (err) console.log(err)
                    else console.log('New Student saved!');
                });
            });
        }

        sendMessage(sender, 'You have been subscribed!');
    });
}