const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    email: String,
    username: {type: String, required: true, unique: true},
    role: {type:String, default: 'user'},
    isDeleted: {type: Boolean, default: false},
    password: {type: String},
    authProvider: {type: String, default: 'riseMedia'},
    authProviderId: {type: String},
    avatarImg: String,
    location: String,
    categoriesFollowing: String,
})

UserSchema.pre('save', async function(next){
    const user = this;
    if(this.authProvider == "riseMedia"){
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
    }
    next();
})

UserSchema.methods.isValidPassword = async function(password) {
    const user = this;
    const compare = await bcrypt.compare(password, user.password);
    return compare;
}


const User = mongoose.model('User', UserSchema);

module.exports = User;