const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");

exports.create_food = asyncHandler(async (req, res) => {
  const data = await req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const foods = await prisma.Food.create({
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
  const { status } = await req.query;
  let where = {};
  if (status) {
    where = {
      status: true,
    };
  }
  const food = await prisma.Food.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where,
  });
  return res.status(200).send(food);
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
        updatedBy: req.user?.id
      },
    });
    return res.status(200).send(foods);
  } catch (error) {
    return res.status(400).send(error);
  }
});