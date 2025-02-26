const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");

exports.create_category = asyncHandler(async (req, res) => {
  const data = await req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const category = await prisma.FoodCategory.create({
        data: {
            categoryName: data.categoryName,
            images: data.images,
            priority: data.priority,
            categoryType: data.categoryType,
            optionalData: data.optionalData,
            status: data.status == "true" ? true : false,
        },
      });
      return category;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.category_list = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let where = {};
  if (status) {
    where = {
      status: true,
    };
  }
  const category = await prisma.FoodCategory.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where,
  });
  return res.status(200).send(category);
});

exports.update_category = asyncHandler(async (req, res) => {
  const data = await req.body;
  const id = parseInt(req.params.id, 10);
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const category = await prisma.FoodCategory.update({
        where: {
          id: id,
        },
        data: {
            categoryName: data.categoryName,
            images: data.images,
            priority: data.priority,
            categoryType: data.categoryType,
            optionalData: data.optionalData,
            status: data.status == "true" ? true : false,
            updatedAt:new Date(),
            updatedBy: req.user?.id
        },
      });
      return category;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.get_category = asyncHandler(async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const category = await prisma.FoodCategory.findFirst({
      where: {
        id: id,
      },
    });
    return res.status(200).send(category);
  } catch (error) {
    return res.status(400).send(error);
  }
});

exports.delete_category = asyncHandler(async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const category = await prisma.FoodCategory.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
        updatedBy: req.user?.id
      },
    });
    return res.status(200).send(category);
  } catch (error) {
    return res.status(400).send(error);
  }
});
