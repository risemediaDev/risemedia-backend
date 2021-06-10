const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: String,
    _id: mongoose.Schema.Types.ObjectId,
})

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;