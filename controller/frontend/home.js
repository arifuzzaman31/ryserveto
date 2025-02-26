const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");

exports.home_list = asyncHandler(async (req, res) => {
  const { perPage, pageNo, group } = req.query;
  let orderBy = {
    precedency: "asc",
  };
  let where = {
    // group: group,
    status: true,
    deletedAt: null,
  };
  const perPg = perPage ? Number(perPage) : 10;
  const from = Number(pageNo * perPg) - Number(perPg);
  const resp = await prisma.section.findMany({
    skip: pageNo ? from : 0,
    take: perPg,
    where,
    orderBy: orderBy,
    select: {
      id: true,
      title: true,
      subtitle: true,
      pattern: true,
      type: true,
      group: true,
      content: true,
      status: true,
      signature: true,
    },
  });
  return res.status(200).send(resp);
});

exports.foodCategory_list = asyncHandler(async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id, 10);
    const { perPage, pageNo } = req.query;
    let orderBy = {
      priority: "asc",
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
      select: {
        id: true,
        categoryName: true,
        images: true,
        priority: true,
        status: true,
        foods: {
          where: {
            propertyId: propertyId,
          },
          select: {
            id: true,
            name: true,
            images: true,
            propertyId: true,
            price: true,
            description: true,
          },
        },
      },
    });
    return res.status(200).send(resp);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

exports.cuisine_list = asyncHandler(async (req, res) => {
  let where = {
    status: true
  };
  const cuisine = await prisma.cuisine.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where,
  });
  return res.status(200).send(cuisine);
});