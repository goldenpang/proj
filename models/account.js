var mongoose = require('mongoose');

var accountSchema = mongoose.Schema({
	id: String,
	pwd: String,
	name: String,
	admin: Boolean,
	phoneNo: String,
	englishScore: Number,
	chineseScore: Number,
	mathScore: Number
});

module.exports = accountSchema;
