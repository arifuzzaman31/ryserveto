const asyncHandler = require("express-async-handler");
const prisma = require("../../db/prisma");
const ownerService = require("../../services/ownerService");

exports.create_subasset = asyncHandler(async (req, res) => {
  const data = await req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const subasset = await prisma.SubAsset.create({
        data: {
          assetId: data.assetId,
          address: data.address,
          amenities: data.amenities,
          floor: data.floor,
          sqft: Number(data.sqft),
          status: data.status == "true" ? true : false,
        },
      });
      return subasset;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.subasset_list = asyncHandler(async (req, res) => {
  const dataId = await ownerService.propertyBy(req.user);
  const { pageNo, perPage, assetId } = req.query;
  let where = {};
  if (dataId !== "all") {
    where = {
      asset: {
        business: {
          ownerId: dataId,
        },
      },
    };
  }
  if (
    req.user.userType == "BUSINESS_MANAGER" ||
    req.user.userType == "LISTING_MANAGER"
  ) {
    where.assetId = req.user.assetId;
  }
  if (assetId) {
    where = {assetId:Number(assetId)}
  }
  // return res.send(where)
  try {
    const perPg = perPage ? Number(perPage) : 10;
    const pgNo = pageNo ? Number(pageNo) : 1;
    const from = Number(pgNo * perPg) - Number(perPg);
    const [count, subassets] = await prisma.$transaction([
      prisma.SubAsset.count({ where }),
      prisma.SubAsset.findMany({
        skip: pgNo ? from : 0,
        take: perPg,
        where,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          asset: { select: { id: true, propertyName: true } },
        },
      }),
    ]);

    return res.status(200).send({
      pagination: {
        total: Math.ceil(count / perPg),
      },
      data: subassets,
    });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

exports.get_subasset = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const subasset = await prisma.SubAsset.findFirst({
    where: {
      id: id,
    },
    include: {
      asset: { select: { id: true, propertyName: true } },
    },
  });
  return res.status(200).send(subasset);
});

exports.subasset_update = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = await req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const subasset = await prisma.SubAsset.update({
        where: {
          id: id,
        },
        data: {
          assetId: data.assetId,
          address: data.address,
          amenities: data.amenities,
          floor: data.floor,
          sqft: Number(data.sqft),
          status: data.status == "true" ? true : false,
        },
      });
      return subasset;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});
exports.delete_subasset = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const subasset = await prisma.SubAsset.update({
    where: {
      id: id,
    },
    data: {
      deleted: new Date(),
    },
  });
  return res.status(200).send(subasset);
});
