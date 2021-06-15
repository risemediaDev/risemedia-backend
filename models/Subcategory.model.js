const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubCategorySchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type:String, required: true },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, required: true},
})

const SubCategory = mongoose.model('SubCategory', SubCategorySchema);

module.exports = SubCategory;