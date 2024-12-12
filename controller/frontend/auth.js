const asyncHandler = require("express-async-handler");
const userService = require("../../services/userService")
const authService = require("../../services/auth")
const prisma = require("../../lib/db/prisma");

exports.otp_request = asyncHandler(async(req,res) => {
    try {
        const data = await req.body
        const userData = await userService.find_or_createUser(data);
        const setOtp = await userService.sendOtp(userData);
        return res.status(201).send(setOtp);
    } catch (error) {
        return res.status(400).send({error:'Incorrect login'});
    }
})

exports.otp_verify = asyncHandler(async(req,res) => {
    try {
        const data = await req.body
        const userData = await userService.find_or_createUser(data);
        const currentTime = new Date();
        if (data.otp != parseInt(userData.otp,10)) {
            return res.status(400).send({error: 'Incorrect OTP'});
        }
        if (currentTime > userData.otpExpireAt) {
            return res.status(400).send({ error: 'OTP timeout'});
        }
        if(userData.isVerify == false){
            return res.status(200).send(userData);
        }
        const updateUser = await userService.guestLogin(userData)
        return res.status(200).send(updateUser);
    } catch (error) {
        return res.status(400).send({error:'Incorrect login'});
    }
})

exports.update_information = asyncHandler(async (req, res) => {
    try {
        const userData = await userService.find_or_createUser(req.body);
        const updateUser = await userService.userUpdate({...req.body, ...{ platform: "APPS_USER"}}, userData.id)
        return res.status(200).send(updateUser);
    } catch (error) {
        return res.status(400).send({error:'Incorrect login'});
    }
})

exports.guest_login = asyncHandler(async (req, res) => {
    try {
        const userData = await userService.find_or_createUser(req.body);
        const updateUser = await userService.guestLogin(userData)
        return res.status(200).send(updateUser);
    } catch (error) {
        return res.status(400).send({error:'Incorrect login'});
    }  
})

exports.user_logout = asyncHandler(async(req, res) => {
    try {
        const info = req.user;
        if(info.email == 'user@guest.com'){
            return res.status(200).send({status:true, message: 'Logout Successful'});
        }
        await userService.clearSession(info);
        return res.status(200).send({status:true, message: 'Logout Successful'});
    } catch (error) {
        return res.status(400).send({status: false, error: error });
    }
})
exports.auth_me = asyncHandler(async(req,res) => {
   const info = await authService.userByToken(req.headers.authorization)
   const user = await userService.get_user({id:info.id})
   if(user){
        return res.status(200).send(user);
   }
    return res.status(401).send({status:false, message: 'Invalid User' });
})

exports.update_me = asyncHandler(async(req,res) => {
    const id = parseInt(req.params.id, 10);
    const data = await req.body
    const user = await userService.updateUserInfo(data,id)
    return res.status(200).send(user);
})
exports.delete_account = asyncHandler(async(req,res) => {
    let objData = await req.body;
    if(objData.email){
        if(objData.email == 'user@guest.com' || objData.phoneNumber == '01277744111') return {status:404}
      const findUser = await userService.get_user(objData);
      if(!findUser){
            return res.status(400).send({status:false, message: 'User Not Found'})
      } 
    }
    // return objData
    const user = await prisma.user.delete({
        where:objData
    });
    
    await userService.clearSession({id:user.id});
    await userService.bookingDelete({customerId:user.id})
    return res.status(200).send({status:true,user:user, message: 'User Deleted Successful!'})
})

exports.terms_condition = asyncHandler(async(req,res) => {
    const terms = await userService.appsTerms()
    return res.status(200).send(terms);
  })
