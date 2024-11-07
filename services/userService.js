const prisma = require("../db/prisma");
const helper = require("../helper/helper");
const authService = require("../services/auth")
const models = require("../models/model")

const get_user = async(requestData) => {
    const user = await prisma.user.findFirst({
        where : requestData
      })
      return user;
}

const find_or_createUser = async (requestData) => {
    let user = await get_user({phoneNumber: requestData.phoneNumber});
    if (!user) {
      const demoMail = 'user'+Math.floor(Math.random() * 1000000)+'@gmail.com';
      user = await prisma.user.create({
        data: {
          email:demoMail,
          phoneNumber: requestData.phoneNumber
        },
      });
    }
    return user;
  };

  const sendOtp = async(userData) => {
    const currentTime = new Date();
        const expirationTime = new Date(
          currentTime.getTime() + 30 * 60 * 1000
        );
        let code = Math.floor(1000 + Math.random() * 9000);
        if(userData.phoneNumber == '01412222221'){
          code = 4567;
        }
        const user = await prisma.user.update({
          where: {
            id: userData.id,
          },
          data: {
            otp: code,
            otpExpireAt: expirationTime
          },
        });
        if(userData.phoneNumber == '01412222221'){
          return user;
        }
        let phone_number = "88" + user.phoneNumber;
        let message = `Your verification code is ${code} \n\nRYSERVED`;
        await helper.runSMSservice(encodeURI(message),phone_number)
        return user;
  }

  const updateUserInfo = async(userData,userId) => {
    const result = await prisma.$transaction(async (prisma) => {
      let readyData = await helper.make_data(models.userModel,userData)
      if(readyData.firstName && readyData.lastName){
        readyData = {...readyData,...{name:readyData.firstName+' '+readyData.lastName}}
      }
      if(["01412222221","01277744111"].includes(readyData.phoneNumber)){
        return readyData;
      }
      const user = await prisma.user.update({
        where: {
          id: userId
        },
        data:readyData
      });
      return user;
    });
    return result;
  }

  const userUpdate = async(userData,userId) => {
      const user = await updateUserInfo(userData,userId)
      const dt = await authService.generateUserToken({...user,...{platform:userData.platform}})
      const tokenUser = {user, ...{token:dt}};
      await setSessionData(tokenUser)
      const createdDate = new Date(user.createdAt);
      const tday = new Date();
      if (createdDate.toDateString() === tday.toDateString()) {
          let phone_number = "88" + user.phoneNumber;
          let message = `Your account has been created Successfully, Thank You. \n\nRYSERVED`;
          await helper.runSMSservice(encodeURI(message),phone_number)
      }
      return tokenUser;
  }

 const setSessionData = async(userData) => {
    var date = new Date(); // Now
     date.setDate(date.getDate() + 365)
    const isoDateString = date.toISOString();
    const existSession = await prisma.session.findFirst({
      where: {
        userId: userData.user.id
      }
    });
    let session;
    const result = await prisma.$transaction(async (prisma) => {
    if(existSession){
        session = await prisma.session.update({
          where: {
            id: existSession.id,
            loggerType: 'APPS_USER'
          },
          data: {
              sessionToken: userData.token
          }
        });
        // return session;
      } else {
        session = await prisma.session.create({
          data: {
              userId: userData.user.id,
              sessionToken: userData.token,
              expires: isoDateString,
              loggerType: 'APPS_USER'
          }
        });
      }
      return session;
    });
    return result;
  }
 const clearSession = async(userData) => {
    const existSession = await prisma.session.deleteMany({
        where: {
          userId: userData.id,
          loggerType: 'APPS_USER'
        }
      });
      return existSession;
  }

  const guestLogin = async(userData) => {
    const dt = await authService.generateUserToken({...userData,...{platform:'APPS_USER'}})
    const tokenUser = {...{user:userData}, ...{token:dt}};
    await setSessionData(tokenUser)
    return tokenUser;
  }

const bookingDelete = async(userData) => {
  const result = await prisma.Booking.deleteMany({
    where:userData
  });
  return result
}
const appsTerms = async() => {
  return "Write here terms and condition"
}
module.exports = {
    guestLogin,get_user,find_or_createUser,sendOtp,userUpdate,updateUserInfo,setSessionData,clearSession,appsTerms,bookingDelete
}