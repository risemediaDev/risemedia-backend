const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubCategorySchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    parentCategory: String,
})

const SubCategory = mongoose.model('SubCategory', SubCategorySchema);

module.exports = SubCategory;