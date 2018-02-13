CREATE TABLE students (
    profile_id varchar(100), 
    name varchar(255), 
    cr char, 
    primary key(profile_id) 
);

CREATE TABLE teachers (
    profile_id varchar(100), 
    name varchar(255), 
    primary key(profile_id) 
);

CREATE TABLE classrooms ( 
    code varchar(100),
    teacher_id varchar(100), 
    primary key (code),
    foreign key (teacher_id) 
        references teachers (profile_id)
        on delete cascade
        on update cascade
);

CREATE TABLE class_student ( 
    class_code varchar(100), 
    student_id varchar(100),
    primary key(class_code, student_id),
    foreign key (class_code) 
        references classrooms (code)
        on delete cascade 
        on update cascade,
    foreign key (student_id) 
        references students (profile_id)
        on delete cascade 
        on update cascade
);