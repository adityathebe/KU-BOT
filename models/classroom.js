const mongoose = require ('mongoose');

let classSchema = mongoose.Schema({
	code: { type : String, required: true },
	teacher: { type: String, require: false }
});

module.exports = mongoose.model('Classroom', classSchema);