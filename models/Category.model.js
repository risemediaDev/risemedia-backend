const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: {
        type: String, 
        required: true, 
        unique: [true, 'category alreay exists'],
        index: true
    },
    _id: mongoose.Schema.Types.ObjectId,
})

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;