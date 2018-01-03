const mongoose = require('mongoose');

let classSchema = mongoose.Schema({
	code: { type: String, required: true },
	teacher: { type: String, required: true },
	students: { type: Array, required: false }
});

module.exports = mongoose.model('ClassRoom', classSchema);