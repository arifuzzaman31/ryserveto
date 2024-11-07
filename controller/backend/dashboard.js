const asyncHandler = require("express-async-handler");
const prisma = require('../../db/prisma');
const helper = require('../../helper/helper')
const ownerService = require('../../services/ownerService')

exports.sales_data = asyncHandler(async(req,res) => {
    const dataId = await ownerService.propertyBy(req.user)
    // const {slotStatus} = req.query
    let where = {}
    if(dataId != 'all'){
       where.ownerId= dataId
    }
    if ((req.user.userType == 'BUSINESS_MANAGER') || (req.user.userType == 'LISTING_MANAGER')) {
        where.assetId = req.user.assetId
    }
    const filteredDocuments = await prisma.Booking.findMany({
        where,
        orderBy: {
            startDate: 'asc'
        },
    });

    const sumByMonth = {};
    const mont = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    mont.forEach(month => {
        sumByMonth[month] = 0;
    });
    filteredDocuments.forEach(item => {
        const startDate = new Date(item.startDate);
        const month = startDate.getMonth();
        const yearMonth = mont[month];
        sumByMonth[yearMonth] += item.grandTotal;
    });

    const todayFM = new Date();
    const last30Days = [];
    const last7Days = [];
    for (let i = 0; i < 30; i++) {
        const date = new Date(todayFM);
        date.setDate(todayFM.getDate() - i);
        const dateString = date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
        last30Days.push({
            startDate: dateString,
            _sum: { grandTotal: 0 }
        });
    }
    for (let i = 0; i < 7; i++) {
        const date = new Date(todayFM);
        date.setDate(todayFM.getDate() - i);
        const dateString = date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
        last7Days.push({
            startDate: dateString,
            _sum: { grandTotal: 0 }
        });
    }
    const monthlyBalance = await prisma.Booking.groupBy({
        by: ['startDate'],
        where: {
            ...where,
            startDate: {
                lte: todayFM,
                gte: new Date(todayFM.setDate(todayFM.getDate() - 30)), // 30 days ago from today
            }
        },
        _sum: {
            grandTotal: true
        }
    });
    // Create a map for easy lookup of monthlyBalance by date
    const monthlyBalanceMap = new Map();
    monthlyBalance.forEach(entry => {
        const dateKey = entry.startDate.split('T')[0];
        monthlyBalanceMap.set(dateKey, entry._sum.grandTotal);
    });
    // Update last30Days with the actual values from monthlyBalance
    const formattedMonthlyBalance = last30Days.map(entry => {
        const grandTotal = monthlyBalanceMap.get(entry.startDate) || 0;
        return {
            startDate: helper.formatDate(entry.startDate),
            _sum: { grandTotal }
        };
    });
    const formattedLast7Days = last7Days.map(entry => {
        const grandTotal = monthlyBalanceMap.get(entry.startDate) || 0;
        return {
            startDate: helper.formatDateWithDayName(entry.startDate),
            _sum: { grandTotal }
        };
    });
    return res.status(200).send({
            annualy:sumByMonth,
            monthly: formattedMonthlyBalance,
            weekly: formattedLast7Days
    })
})

exports.status_data = asyncHandler(async(req,res) => {
    const dataId = await ownerService.propertyBy(req.user)
    const {slotStatus} = req.query
    let where = {}
    if(dataId != 'all'){
       where.ownerId= dataId
    }
    if ((req.user.userType == 'BUSINESS_MANAGER') || (req.user.userType == 'LISTING_MANAGER')) {
        where.assetId = req.user.assetId
    }
    let ttdays = 30
    let today = new Date();
    let prevDat = new Date(today.getTime() - (ttdays * 24 * 60 * 60 * 1000));
    const slotPerformance = await prisma.Booking.groupBy({
        by: ['slot'],
        where:{
            ...where,
            status:slotStatus,
            startDate: {
                lte: today,
                gte: prevDat,
            }
        },
        _count: true
    })
    let morning = ['6 AM','7 AM','8 AM','9 AM','10 AM','11 AM']
    let noon = ['12 PM','1 PM','2 PM','3 PM']
    let evening = ['4 PM','5 PM','6 PM']
    let night = ['7 PM','8 PM','9 PM','10 PM','11 PM']
    let mornCount = 0
    let noonCount = 0
    let eveningCount = 0
    let nightCount = 0
    
    slotPerformance.map((item)=>{
        if(morning.includes(item.slot)){ return mornCount+=Number(item._count)}
        else if(noon.includes(item.slot)){ return noonCount+=Number(item._count)}
        else if(evening.includes(item.slot)){ return eveningCount+=Number(item._count)}
        else if(night.includes(item.slot)){ return nightCount+=Number(item._count)}
        else { return ;}
    })

    const statusSet = ["ON_HOLD","CONFIRMED","CANCELED","COMPLETED"]
    const countStatusData = await prisma.Booking.groupBy({
        by: ['status'],
        where:{
            ...where,
            startDate: {
                lte: today,
                gte: prevDat,
            }
        },
        _count: true,
        _sum:{
            guestNumber: true
        }
      });
   
      const statusData = statusSet.map(item => {
            const vt = countStatusData.find(it => item == it.status)
            if(!vt){
                return {
                    _count:0,
                    _sum:{
                        guestNumber:0
                    },
                    status:item
                }
            }
            return vt
        })

        let occupancy = {Morning:(mornCount/ttdays).toFixed(2),Noon:(noonCount/ttdays).toFixed(2),Evening:(eveningCount/ttdays).toFixed(2),
            Night:(nightCount/ttdays).toFixed(2)}

    return res.status(200).send({
        statusData,slotPerformance,
        occupancyData:occupancy,
    })
})

exports.owner_list = asyncHandler(async(req,res) => {
    const dataId = await ownerService.propertyBy(req.user)
    let where = {}
    if(dataId != 'all'){
       where.ownerId= dataId
    }
    if ((req.user.userType == 'BUSINESS_MANAGER') || (req.user.userType == 'LISTING_MANAGER')) {
        where.assetId = req.user.assetId
    }
    const ownerData = await prisma.SubAssetComponent.findMany({
        where,
        skip:0,take:5,
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            id: true,
            assetId: true,
            ownerId: true,
            listingName: true,
            status: true,
            asset: {
                select: {
                    id: true,
                    propertyName: true,
                    logo: true
                }
            },
            owner: {
                select: {
                    id: true,
                    name: true,
                    phoneNumber: true,
                    email: true,
                    createdAt: true,
                    status: true
                }
            }
        }
    });
    return res.status(200).send(ownerData)
})

exports.state_data = asyncHandler(async(req,res) => {
    const dataId = await ownerService.propertyBy(req.user)
    let where = {}
    if(dataId != 'all'){
       where.ownerId= dataId
    }
    if ((req.user.userType == 'BUSINESS_MANAGER') || (req.user.userType == 'LISTING_MANAGER')) {
        where.assetId = req.user.assetId
    }
    const totalCount = await prisma.Booking.aggregate({
        where,
        _count: true,
        _sum: {
            grandTotal: true
        }
    });
    const countRestaurant = await prisma.SubAssetComponent.count({
        where:{
            ...where,
            type: 'RESTAURANT'
        }
    });
    return res.status(200).send({totalCount,countRestaurant})
})