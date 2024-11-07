const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");
const helper = require("../../helper/helper");
const authService = require("../../services/auth")
const ownerService = require("../../services/ownerService")

exports.attempt_to_login = asyncHandler(async (req, res, next) => {
  const { email, password } = await req.body;
  try {
    const user = await prisma.Owner.findUnique({
      where: {
        email: email,
      },
      include: {
        roles: true
      }
    });

    if (!user) {
      res.status(422).json({ message: "This Email is Not Found!" });
      return;
    }
    const hashChk = await helper.hashCheck(password, user.password);
    if (!hashChk) {
      res.status(422).json({ message: "Incorrect Password!" });
      return;
    }
    const permUser = await authService.permissionSetter(user)
    const token = await authService.generateUserToken({ ...permUser, ...{ platform: "DASHBOARD_USER" } })
    const tokenUser = { user, ...{ token: token } };
    return res.status(200).send(tokenUser);
  } catch (error) {
    return res.status(401).send(error);
  }
});

exports.auth_me = asyncHandler(async(req,res) => {
  const info = await authService.userByToken(req.headers['authorization'])
  if(info){
       return res.status(200).send(info);
  }
   return res.status(401).send({status:false, message: 'Invalid User' });
})

exports.all_permission = asyncHandler(async(req,res) => {
  const permission = await ownerService.allPermission()
  return res.status(200).send(permission);
})
