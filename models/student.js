const mongoose = require ('mongoose');

let studentSchema = mongoose.Schema({
	profileID: { type: String, required: true},
	name: { type : String, required: false },
	cr : { type: Boolean, required: true },
	subscribed_to : { type: Array, required: false }
});

module.exports = mongoose.model('Student', studentSchema);