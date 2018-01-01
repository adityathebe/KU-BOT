const mongoose = require('mongoose');

let teacherSchema = mongoose.Schema({
	profileID: {type: String, required: true },
	name: { type: String, required: false },
	classes: { type: Array, required: false }
});

module.exports = mongoose.model('Teacher', teacherSchema);