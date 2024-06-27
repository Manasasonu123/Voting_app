const express=require('express')
const User = require('../models/user')
const router=express.Router()
const {jwtAuthMiddleware,generateToken} =require('../jwt')

router.post('/signup',async(req,res) => {
      try{
        const data=req.body    //Assuming the request body contains the person data
        if(data.role=='admin'){
            const adminExist=await User.findOne({role:'admin'})
            if(adminExist){
               return res.status(403).json({message:'Admin already exists'})
            }
        }
        //create newPerson doc using Mongoose model
       const newUser=new User(data)

        //Save the new user to database
        const response=await newUser.save()
        console.log('data saved')

        const payload={
          id:response.id            //we dont send aadhar no here because if someone gets the token they will get aadhar number
        }
        console.log(JSON.stringify(payload))

        const token=generateToken(payload)
        console.log("Token is: ",token)

        res.status(200).json({response:response,token:token})
          
      }catch(err){  //contains error from newPerson
        console.log(err)
        res.status(500).json({error:'Internal server error'})
      }
      
     })


     //login route
     router.post('/login',async(req,res)=>{
      try{
        //extract username and password fom request body
        const {aadharCardNumber,password}=req.body

        //find user by username
        const user= await User.findOne({aadharCardNumber:aadharCardNumber})

        //if user does not exist or password does not match return error
        if(!user || !(await user.comparePassword(password))){
          return res.status(401).json({error:'Invalid usrname or password'})
        }
        //generate token
        const payload={
          id:user.id,
        }

        const token=generateToken(payload)

        //return token as resposnse
        res.json({token})
      }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal server error'})

      }
     })


     //profile route
     router.get('/profile',jwtAuthMiddleware,async (req,res)=>{
      try{
        const userData=req.user;
        const userId=userData.id
        const user=await User.findById(userId)

        res.status(200).json(user)
      }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal server error'})
      }
     })


   router.put('/profile/password',jwtAuthMiddleware, async(req,res)=>{
    try{
        const userId=req.user.id //extract id from the token
        const {currentPassword,newPassword}=req.body   //extract current and new passwords

        //find user by userId
        const user= await User.findById(userId)

         //if  password does not match return error
         if( !(await user.comparePassword(currentPassword))){
            return res.status(401).json({error:'Invalid usrname or password'})
          }

          //update users password
         user.password=newPassword;
         await user.save()


        console.log("Password updated")
        res.status(200).json({message:'Password updated'})
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal server error'})
    }
   })

  //  router.get('/',async(req,res)=>{
  //   try{
  //     //list of candidates
  //     const data=await User.find()
  //   console.log('data fetched')
  //    return  res.status(200).json(data)
  
  //   }catch(err){
  //     console.log(err);
  //     res.status(500).json({ error: 'Internal server error' });
  //   }
  // })

   //comment added for testing purpose
 module.exports=router  

