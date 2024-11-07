const asyncHandler = require("express-async-handler");
const prisma = require("../../db/prisma");
const ownerService = require("../../services/ownerService")
const ExcelJS = require("exceljs");

exports.get_report = asyncHandler(async (req, res) => {
    const {pageNo,perPage,status,event,startDate,endDate} = req.query;
    const dataId = await ownerService.propertyBy(req.user)
    let where = {}
    if(dataId != 'all'){
       where.ownerId= dataId
    }
    if ((req.user.userType == 'BUSINESS_MANAGER') || (req.user.userType == 'LISTING_MANAGER')) {
        where.assetId = req.user.assetId
    }
    if(status) where.status = status
    if(event){ 
        if(event == 'Regular'){ 
            where.bookingType = 'Regular'
        } else {
            where.bookingType = {
                    not: 'Regular',
                }
        }
    }
    
    if(startDate && endDate){
        where.startDate = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
    }
    const perPg = perPage ? Number(perPage) : 10
    const from = Number(pageNo*perPg)-Number(perPg)
    const [count,bookings] = await prisma.$transaction([
        prisma.Booking.count({where}),
        prisma.Booking.findMany({
            skip: pageNo ? from : 0,
            take: perPg,
            orderBy: {
                createdAt: 'desc',
            },
            where,
            include: {
                customer:  {
                    select: {
                        id:true,name:true,phoneNumber:true
                    }
                },
                subAssetComponent: {
                    select: {
                        id:true,listingName:true,type:true,reservationCategory:true
                    }
                },
                table: {
                    select: {
                        id:true,capacity:true,type:true,size:true
                    }
                },
                seatBed: {
                    select: {
                        id:true,type:true,roomNo:true
                    }
                }
            }
        })
      ]);

   return res.status(200).send({
        pagination: {
            total: Math.ceil(count / perPg)
        },
        data: bookings
    });
})

exports.excel_download = asyncHandler(async(req,res) => {
    const {from,status} = await req.query
    const data = await generateExcelData(req.user,from,status);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');
    // Populate worksheet with data
    if(from == 'revenue'){
        worksheet.columns = [
            { header: 'SL NO', key: 'col1', width: 10 },
            { header: 'PROPERTY NAME', key: 'col2', width: 20 },
            { header: 'CUSTOMER NAME', key: 'col3', width: 20 },
            { header: 'PHONE', key: 'col4', width: 20 },
            { header: 'DATE', key: 'col5', width: 20 },
            { header: 'SLOT', key: 'col6', width: 10 },
            { header: 'TOTAL', key: 'col7', width: 10 },
            { header: 'STATUS', key: 'col8', width: 20 }
        ];
    }
    if(from == 'upcomming' || from == 'completed' || from == 'canceled'){
        worksheet.columns = [
            { header: 'SL NO', key: 'col1', width: 10 },
            { header: 'PROPERTY NAME', key: 'col2', width: 20 },
            { header: 'CUSTOMER NAME', key: 'col3', width: 20 },
            { header: 'PHONE', key: 'col4', width: 20 },
            { header: 'SLOT', key: 'col5', width: 10 },
            { header: 'NO. OF GUESTS', key: 'col6', width: 20 },
            { header: 'ASSIGNED TABLE', key: 'col7', width: 20 },
            { header: 'SPECIAL REQUESTS', key: 'col8', width: 20 },
            { header: 'PRE ORDER', key: 'col9', width: 10 },
            { header: 'MEMBERSHIP TYPE', key: 'col10', width: 20 },
            { header: 'REFERENCE', key: 'col11', width: 20 },
            { header: 'REMARKS', key: 'col12', width: 20 },
            { header: 'STATUS', key: 'col13', width: 20 }
        ];
    }
    data.forEach(row => {
        worksheet.addRow(row);
    });
     const buffer = await workbook.xlsx.writeBuffer();
     res.setHeader('Content-Disposition', 'attachment; filename="report.xlsx"');
     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
     res.status(200).send(buffer);
     return ;
})

async function generateExcelData(user,from,status) {
    const dataId = await ownerService.propertyBy(user)
    let where = {}
    if(dataId != 'all'){
       where.ownerId= dataId
    }
    if(status) where.status = status
    const bookings = await prisma.Booking.findMany({
        where,
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            customer:  {
                select: {
                    id:true,name:true,phoneNumber:true
                }
            },
            subAssetComponent: {
                select: {
                    id:true,listingName:true,type:true,reservationCategory:true
                }
            },
            table: {
                select: {
                    id:true,capacity:true,type:true,size:true
                }
            }
        }
    })
    // Process and format data as needed
    let mkData = []
    if(from == 'revenue'){
        bookings.forEach((v,i) => {
            mkData.push({
                col1: ++i, col2: v.subAssetComponent.listingName,
                col3: v.customer.name, col4: v.phoneNumber,
                col5: v.startDate, col6: v.slot,
                col7: v.grandTotal, col8: v.status
            })
        })
    }
    if(from == 'upcomming' || from == 'completed' || from == 'canceled'){
        bookings.forEach((v,i) => {
            mkData.push({
                col1: ++i, col2: v.subAssetComponent.listingName,
                col3: v.customer.name, col4: v.phoneNumber,
                col5: v.slot, col6: v.guestNumber,
                col7: v.table.type +'-'+ v.table.capacity, col8: v.customerRequest,
                col9: '', col10: 'Regular',
                col11: 'Ryserved Apps', col12: v.comment, col13: v.status
            })
        })
    }
    return mkData;
  }