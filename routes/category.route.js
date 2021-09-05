const express = require('express');
const Router = express.Router();
const Category = require('../models/Category.model');
const SubCategory = require('../models/Subcategory.model');
const mongoose = require('mongoose');
const passport = require('passport');

// GET /category
// ACCESSIBLE to Auth user
// Displays all the categories in the database
Router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    if(req.isAuthenticated()){
        Category
            .find({})
            .then(result => res.status(200).json(result))
            .catch(err => res.status(400).json({error: err}))
    }    
});

// GET /category/:id
// ACCESSIBLE to auth user
// Displays a category by a set criteria
Router.get('/:id', async (req,res)=>{
        var id = req.params.id;
        var query = {_id: id};
        if(!mongoose.isValidObjectId(id)){
            query = {name: id};
        }
        await Category
            .find(query)
            .then(async (categoryInfo) => {
                if(!categoryInfo[0]) return res.status(200).json([...categoryInfo, []]);
                await SubCategory.find({parentCategory:categoryInfo[0]._id}).then((subCategories) => {
                    console.log('sent category list of ' + categoryInfo[0].name)
                    return res.status(200).json([
                        ...categoryInfo, 
                        [...subCategories]
                        
                    ])
                })
            })
            .catch(error => {
                console.log(`failed to send category details for ${id} because ${error}`)
                return res.json(error)
            });
});

// POST /category/create
// ACCESSIBLE to authenticated users
// Creates a new category
Router.post('/create', passport.authenticate('jwt', {session: false}),(req,res)=>{
    if(req.isAuthenticated()){
        const newCategory = new Category({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.categoryName
        })
        newCategory
            .save()
            .then(result => res.send(result))
            .catch(err => res.send(err))
    }
});

// POST category/subcategory/create
// ACCESSIBLE to authenticated users
// Creates a new subcategory
Router.post('/subcategory/create', passport.authenticate('jwt', {session: false}),(req,res)=>{
    if(req.isAuthenticated()){
        const newSubCategory = new SubCategory({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            parentCategory: req.body.parentCategory
        })
        newSubCategory
            .save()
            .then(result => {
                console.log(`${req.user._id} created subcategory ${result.name}`)
                res.status(200).json(result)
            })
            .catch(err => {
                console.log(`failed to create subcategory ${req.body.name} because ${err}`)
                res.status(400).json({error: err})
            })
    }
});


// DELETE /category/delete
// ACCESSIBLE to authenticated users
// Deletes a category by id
Router.delete('/delete', passport.authenticate('jwt', {session: false}),(req,res)=>{
    if(req.isAuthenticated()){
        Category
            .deleteOne({_id: req.body.categoryId})
            .then(result => res.send(result))
            .catch(err => res.send(err))
    }
});

// DELETE category/subcategory/delete
// ACCESSIBLE to authenticated users
// Deletes a subcategory by id
Router.delete('/subcategory/delete', passport.authenticate('jwt', {session: false}),(req,res)=>{
    if(req.isAuthenticated()){
        SubCategory
            .deleteOne({_id: req.body.categoryId})
            .then(result => res.send(result))
            .catch(err => res.send(err))
    }
});


Router.post('/subcategory/edit', passport.authenticate('companyUser', {session: false}), (req, res) => {
    if(!req.body._id || !req.body.name) {return res.status(400)}
    let id = req.body._id;
    let updatedName = req.body.name;
    SubCategory.findByIdAndUpdate(id , {name: updatedName}).then(result => {
        res.send(result)
    }).catch(err => res.status(400).send(err))
});

module.exports = Router;