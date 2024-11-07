const asyncHandler = require("express-async-handler");
const prisma = require("../../db/prisma");

exports.add_to_wishList = asyncHandler(async (req, res) => {
  try {
    const data = await req.body;
    const result = await prisma.$transaction(async (prisma) => {
      const wishList = await prisma.wishList.create({
        data: {
          userId: req.user.id,
          type: data.type,
          subAssetComponentId: data.subAssetComponentId,
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
  const subassetComp = await prisma.subAssetComponent.findMany({
    where: {
      wishLists: {
        some: {
          userId: req.user.id,
        },
      },
    },
    include: {
      asset: {
        select: {
          id: true,
          propertyName: true,
          city: true,
          area: true,
          geoTag: true,
          country: true,
          bookingCount: true,
        },
      },
    },
  });
  return res.status(200).send(subassetComp);
});

exports.destroy_wishList = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const wishList = await prisma.wishList.deleteMany({
    where: {
      AND: [{ userId: req.user.id }, { subAssetComponentId: id }],
    },
  });
  return res.status(200).send(wishList);
});
