const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");

exports.home_list = asyncHandler(async (req, res) => {
    const { perPage,pageNo,group } = req.query
    let orderBy = {
        precedency: "asc"
    };
    let where = {
        group: group,
        status: true,
        deletedAt:null
    };
    const perPg = perPage ? Number(perPage) : 10;
  const from = Number(pageNo * perPg) - Number(perPg);
    const resp = await prisma.section.findMany({
        skip: pageNo ? from : 0,
        take: perPg,
        where,
        orderBy: orderBy,
        select: { id: true, title: true, subtitle: true, pattern: true,
            type: true, group: true,content: true,status: true, signature: true }    
    });
    return res.status(200).send(resp);
});

exports.foodCategory_list = asyncHandler(async (req, res) => {
    const { perPage,pageNo } = req.query
    let orderBy = {
        priority: "asc"
    };
    let where = {
        status: true,
        deletedAt:null
    };
    const perPg = perPage ? Number(perPage) : 10;
  const from = Number(pageNo * perPg) - Number(perPg);
    const resp = await prisma.FoodCategory.findMany({
        skip: pageNo ? from : 0,
        take: perPg,
        where,
        orderBy: orderBy,
        select: { id: true, categoryName: true, images: true, priority: true,status: true }    
    });
    return res.status(200).send(resp);
});

