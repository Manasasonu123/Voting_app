const mongoose=require('mongoose')
const bcrypt=require('bcrypt')   //to hash+salt the password 

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    email:{
        type:String,
    },
    mobile:{
        type:String,
    },
    address:{
        type:String,
        required:true
    },
    aadharCardNumber:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['voter','admin'],
        default:'voter'
    },
    isVoted:{
        type:Boolean,
        default:false
    }

})
userSchema.pre('save',async function(next){
    const person = this;

    //hash the password only if it is modified or new
    if(!person.isModified('password'))   
        return next()
    try{
        //hash password generation
        const salt=await bcrypt.genSalt(10);     //it is responsible for adding salt...   longer the length more secure but high computation cost
        //hash password
        const hashpassword=await bcrypt.hash(person.password,salt)
        //override the plain password with hashed one
        person.password=hashpassword
        next()
    }catch(err){
        return next(err)
    }
})

userSchema.methods.comparePassword=async function(candidatePassword){
    try{
        //use bcrypt to compare the provided passord with the hashed password
        const isMatch=await bcrypt.compare(candidatePassword,this.password)
        return isMatch;
    }catch(err){
        throw err;
    }
}


const User=mongoose.model('User',userSchema);
module.exports=User;

