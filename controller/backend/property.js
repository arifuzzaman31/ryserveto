const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");
const ownerService = require("../../services/ownerService");

exports.create_property = asyncHandler(async (req, res) => {
  const data = await req.body;
  try {
    const ownerId = await ownerService.propertyBy(req.user);
  
    const result = await prisma.$transaction(async (prisma) => {
      const property = await prisma.Property.create({
        data: {
          owner: { connect: { id: ownerId } },
          type: data.type,
          listingName: data.listingName,
          title: data.title,
          subTitle: data.subTitle,
          logo: data.logo,
          sectSymb: 0,
          priority: 0,
          slot: data.slot,
          offday: data.offday,
          images: data.images,
          terms: data.terms,
          cuisines: data.cuisines,
          description: data.description,
          reservationCategory: data.reservationCategory,
          eventStatus: false,
          status: data.status == "true" ? true : false
        }
      });
      return property;
    });
    return res.status(201).send(result);
  } catch (error) {
    return res.status(500).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.property_list = asyncHandler(async (req, res) => {
  const { pageNo, perPage } = await req.query;
  const dataId = await ownerService.propertyBy(await req.user);
  let where = {};
  if (dataId != "all") {
    where.ownerId = dataId;
  }
  const { keyword } = await req.query;
  if (keyword) {
    where.listingName = {
      contains: keyword,
      mode: "insensitive",
    };
  }
  if (
    req.user.userType == "BUSINESS_MANAGER" ||
    req.user.userType == "LISTING_MANAGER"
  ) {
    // where.assetId = req.user.assetId;
  }
  const perPg = perPage ? Number(perPage) : 10;
  const from = Number(pageNo * perPg) - Number(perPg);

  const [count, property] = await prisma.$transaction([
    prisma.Property.count({ where }),
    prisma.Property.findMany({
      skip: pageNo ? from : 0,
      take: perPg,
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        ownerId: true,
        type: true,
        listingName: true,
        logo: true,
        images: true,
        eventStatus: true,
        reservationCategory: true,
        // branches: true,
        status: true
        // tables: true,
        // prices: true,
      },
    }),
  ]);

  return res.status(200).send({
    pagination: {
      total: Math.ceil(count / perPg),
    },
    data: property,
  });
});

exports.property_listwith_slot = asyncHandler(async (req, res) => {
  const { pageNo, perPage } = await req.query;
  const dataId = await ownerService.propertyBy(await req.user);
  let where = {};
  if (dataId != "all") {
    where.ownerId = dataId;
  }
  const { keyword } = req.query;
  if (keyword) {
    where.listingName = {
      contains: keyword,
      mode: "insensitive",
    };
  }
  if (
    req.user.userType == "BUSINESS_MANAGER" ||
    req.user.userType == "LISTING_MANAGER"
  ) {
    // where.assetId = req.user.assetId;
  }
  const perPg = perPage ? Number(perPage) : 10;
  const from = Number(pageNo * perPg) - Number(perPg);

  const [count, property] = await prisma.$transaction([
    prisma.Property.count({ where }),
    prisma.Property.findMany({
      skip: pageNo ? from : 0,
      take: perPg,
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        listingName: true,
        status: true,
        tables: true,
        slot:true
      },
    }),
  ]);

  return res.status(200).send({
    pagination: {
      total: Math.ceil(count / perPg),
    },
    data: property,
  });
});

exports.get_property = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const property = await prisma.Property.findFirst({
    where: {
      id: id,
    },
    include: {
      owner: { select: { id: true, name: true } },
      tables: { select: { id: true, propertyId: true,type: true,capacity: true,position: true,size: true,splitable: true,ryservable: true,status:true } }
    },
  });
  return res.status(200).send(property);
});

exports.property_update = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = await req.body;
  try {
    const prevasset = await prisma.Property.findFirst({
      where: {
        id: id,
      },
    });
    const prepareData = { ...prevasset, ...data };
    prepareData.status = data.status == "true" ? true : false;

    delete prepareData["id"];
    delete prepareData["ownerId"];
    delete prepareData["table"];
    delete prepareData["createdAt"];
    delete prepareData["updatedAt"];
    delete prepareData["deletedAt"];
    const result = await prisma.$transaction(async (prisma) => {
      const property = await prisma.Property.update({
        where: {
          id: id,
        },
        data: prepareData,
      });

      return property;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});
exports.delete_property = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const property = await prisma.Property.update({
    where: {
      id: id,
    },
    data: {
      deletedAt: new Date(),
    },
  });
  return res.status(200).send(property);
});

exports.property_signature = asyncHandler(async(req,res) => {
  try {
    const data = await req.body;
    const property = await prisma.Property.updateMany({
      where: {
        id: { in: data.ids }
      },
      data: {
        sectSymb: data.signature
      },
    });
    return res.status(200).send(property);

  } catch (error) {
    return res.status(500).send({ details: error.message });
  }
});
