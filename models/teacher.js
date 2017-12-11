const mongoose = require('mongoose');

let teacherSchema = mongoose.Schema({
	code: { type: String, required: true },
	profileID: {type: String, required: true },
	name: { type: String, required: false },
	course: { type: String, required: false }
});

module.exports = mongoose.model('Teacher', teacherSchema);