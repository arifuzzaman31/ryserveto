const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");
const ownerService = require("../../services/ownerService");

exports.create_food = asyncHandler(async (req, res) => {
  const data = await req.body;
  // return res.status(200).send(data);
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const foods = await prisma.Food.create({
        data: {
            categoryId: data.categoryId,
            name: data.name,
            images: data.images,
            rating: Number(data.rating) ?? 0,
            propertyId: data.propertyId,
            price: data.price,
            description: data.description,
            // optionalData: data.optionalData,
            status: data.status == "true" ? true : false,
        },
      });
      return foods;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.food_list = asyncHandler(async (req, res) => {
  const { pageNo, perPage, status, keyword } = req.query;
    const dataId = await ownerService.propertyBy(await req.user);
    let where = {};
    if (dataId != "all") {
      where.property = {ownerId : dataId};
    }

    if (status) {
      where.status = true;
    }
    if (keyword) {
      where.name = {
        contains: keyword,
        mode: "insensitive",
      };
    }
    if (
      req.user.userType == "BUSINESS_MANAGER" ||
      req.user.userType == "LISTING_MANAGER"
    ) {
      
    }
    const perPg = perPage ? Number(perPage) : 10;
    const from = Number(pageNo * perPg) - Number(perPg);
    const [count, foods] = await prisma.$transaction([
      prisma.Food.count({ where }),
      prisma.Food.findMany({
        skip: pageNo ? from : 0,
        take: perPg,
        where,
        orderBy: {
          id: "desc",
        },
        select: {
          id: true,
          name: true,
          categoryId: true,
          images: true,
          propertyId: true,
          price: true,
          description: true,
          status: true,
          category:{select:{id:true,categoryName:true}},
          property:{select:{id:true,listingName:true}}
        },
      }),
    ]);
  return res.status(200).send({
    pagination: {
      total: Math.ceil(count / perPg),
    },
    data: foods,
  });
});

exports.update_food = asyncHandler(async (req, res) => {
  const data = await req.body;
  const id = parseInt(req.params.id, 10);
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const foods = await prisma.Food.update({
        where: {
          id: id,
        },
        data: {
            categoryId: data.categoryId,
            name: data.name,
            images: data.images,
            rating: data.rating,
            propertyId: data.propertyId,
            price: data.price,
            description: data.description,
            optionalData: data.optionalData,
            status: data.status == "true" ? true : false,
            updatedAt:new Date(),
            updatedBy: req.user?.id
        },
      });
      return foods;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.food_price_update = asyncHandler(async (req, res) => {
  const data = await req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const foods = await prisma.Food.updateMany({
        where: {
          status: true,
        },
        data: {
            price: data.price,
            status: true,
            updatedAt:new Date(),
        },
      });
      return foods;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.get_food = asyncHandler(async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const foods = await prisma.Food.findFirst({
      where: {
        id: id,
      },
    });
    return res.status(200).send(foods);
  } catch (error) {
    return res.status(400).send(error);
  }
});

exports.delete_food = asyncHandler(async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const foods = await prisma.Food.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
        status: false,
        updatedBy: req.user?.id
      },
    });
    return res.status(200).send(foods);
  } catch (error) {
    return res.status(400).send(error);
  }
});