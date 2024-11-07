const userModel = ['firstName','lastName','email','birthDate','phoneNumber','residenceAddress','status','otp','isVerify','otpExpireAt','userType','picture','country','city','location','occupation','designation','nid','tin','password','deleted']
const bookingModel = ['assetId','subAssetId','subAssetCompId','tableId','seatBedId','ownerId','customerId','customerName','phoneNumber','startDate','endDate','slot',
    'comment','customerRequest','cancelReason','guestNumber','amount','vat','discount','grandTotal','status','bookingType','deleted'
]
module.exports = {
    userModel,bookingModel
}