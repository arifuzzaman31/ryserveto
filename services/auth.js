const jwt = require('jsonwebtoken');

const generateUserToken = async (userData) => {
  const payload = {
    id: userData.id,
    name: userData.name,
    userType: userData.userType,
    platform: userData.platform == 'apps' ? 'APPS_USER' : userData.platform
  };
  if (["BUSINESS_MANAGER","LISTING_MANAGER"].includes(userData.userType)) {
    payload.branchId = userData.roles?.branchId;
  }
  if(["apps","APPS_USER"].includes(userData.platform)) {
    payload.email = userData.email
    payload.phoneNumber = userData.phoneNumber
  }
  const secret = process.env.JWT_SECRET;
  const expireTime = process.env.JWT_EXPIRES_IN;
  const options = { expiresIn: expireTime };
  const token = await jwt.sign(payload, secret, options);
  return token;
}
const userByToken = async (token) => {
  const secret = process.env.JWT_SECRET;
  var authorization = token.split(' ')[1];
  const info = await jwt.verify(authorization, secret);
  return info;
}

const permissionSetter = async (user) => {
  let permissions = null
  if ((user.userType == 'BUSINESS_OWNER') || (user.userType == 'CRM_EDITOR')) {
    permissions = ['property-create', 'property-view', 'property-edit', 'property-delete',
  'branch-create', 'branch-view', 'branch-edit', 'branch-delete',
  'reservation-view', 'reservation-create', 'reservation-edit', 'reservation-delete',
  'report-view', 'revenue-report', 'upcoming-report', 'complete-report', 'cancel-report',
  'role-create', 'role-view', 'role-edit', 'role-delete',
  'employee-create', 'employee-view', 'employee-edit', 'employee-delete']
    if (user.userType == 'CRM_EDITOR') permissions.push('amenities-view', 'partner-view', 'cuisine-view')
    user.roles = { permissions }
  }
  return user;
}

module.exports = {
  userByToken, generateUserToken, permissionSetter
}