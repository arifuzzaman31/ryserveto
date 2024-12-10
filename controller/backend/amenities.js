const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");

exports.create_amenity = asyncHandler(async (req, res) => {
  const data = await req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const amenities = await prisma.amenities.create({
        data: {
          name: data.name,
          icon: data.icon,
          price: data.price ? Number(data.price) : 0,
          status: data.status == "true" ? true : false,
        },
      });
      return amenities;
    });
    return res.status(201).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.amenity_list = asyncHandler(async (req, res) => {
  const { status } = req;
  let where = {};
  if (status) {
    where = {
      status: true,
    };
  }
  const amenity = await prisma.amenities.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where,
  });
  res.status(200).send(amenity);
});

exports.update_amenity = asyncHandler(async (req, res) => {
  const data = await req.body;
  const id = parseInt(req.params.id, 10);
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const amenity = await prisma.amenities.update({
        where: {
          id: id,
        },
        data: {
          name: data.name,
          icon: data.icon,
          price: Number(data.price),
          status: data.status == "true" ? true : false,
          updatedBy: req.user?.id,
          updatedAt:new Date()
        },
      });
      return amenity
    });
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.get_amenity = asyncHandler(async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const amenities = await prisma.amenities.findFirst({
      where: {
        id: id,
      },
    });
    res.status(200).send(amenities);
  } catch (error) {
    res.status(400).send(error);
  }
});

exports.delete_amenity = asyncHandler(async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await prisma.$transaction(async (prisma) => {
      const amenities = await prisma.amenities.update({
        where: {
          id: id,
        },
        data: {
          deletedAt: new Date(),
          updatedBy: req.user?.id
        },
      });
      return amenities;
    });
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send(error);
  } finally {
    await prisma.$disconnect();
  }
});
