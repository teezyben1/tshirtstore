const { type } = require('express/lib/response')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please provide a name'],
        maxlength: [40, "Name should be under 40 characters"]

    },

    email: {
        type: String,
        required: [true, 'please provide an email'],
        validator: [validator.isEmail, 'Please enter email in correct format'],
        unique: true

    },

    password: {
        type: String,
        required: [true, 'please provide your password'],
        minlength: [8, 'password should be atleast 8 char'],
        select: false
    },

    role: {
        type: String,
        default: 'user'
    },

    photo: {
        id: {
            type:String,
            required:true,
        },
        secure_url:{
            type:String,
            required: true
        }
    },

    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt:{
        type: Date,
        default: Date.now,
    }


})

//Encrypt password before save

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

// Compare password
userSchema.methods.isvalidatedPassword = async function(usersendPassword){
   return await bcrypt.compare(usersendPassword, this.password)
}

//create and return JWT
userSchema.methods.getjwToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    })
}

// generate forget password token (string)
userSchema.methods.getForgetPasswordToken = function(){
    const forgotToken = crypto.randomBytes(20).toString('hex');

    // getting a hash - make sure to get a hash on backend
    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex')

    //time of token
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000

    return forgotToken

}


module.exports = mongoose.model('user', userSchema)