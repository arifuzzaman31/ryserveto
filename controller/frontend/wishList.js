const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");

exports.add_to_wishList = asyncHandler(async (req, res) => {
  try {
    const data = await req.body;
    const result = await prisma.$transaction(async (prisma) => {
      const wishList = await prisma.wishList.create({
        data: {
          userId: req.user.id,
          type: data.type,
          propertyId: data.propertyId,
          status: data.status == "true" ? true : false,
        },
      });
      return wishList;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.get_all_wishList = asyncHandler(async (req, res) => {
  const property = await prisma.subAssetComponent.findMany({
    where: {
      wishLists: {
        some: {
          userId: req.user.id,
        },
      },
    },
    include: {
      property: {
        select: {
          id: true,
          listingName: true,
          title: true,
          subTitle: true,
          logo: true,
          images: true
        },
      },
    },
  });
  return res.status(200).send(property);
});

exports.destroy_wishList = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const wishList = await prisma.wishList.deleteMany({
    where: {
      AND: [{ userId: req.user.id }, { propertyId: id }],
    },
  });
  return res.status(200).send(wishList);
});
