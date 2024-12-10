const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");
const ownerService = require("../../services/ownerService");
const helper = require("../../helper/helper");

exports.create_branch = asyncHandler(async (req, res) => {
  const data = req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const ownerId = await ownerService.propertyBy(req.user);
      let amenity = data.amenities?.map(itm => itm.name)
      // return res.status(200).send(amenity);
      const branch = await prisma.branch.create({
        data: {
          branchName: data.branchName,
          slug: helper.slugify(data.branchName),
          owner: {connect: {id: ownerId}},
          property: {connect: {id: data.propertyId}},
          country: data.country,
          city: data.city,
          area: data.area,
          location: data.location,
          amenities: data.amenities,
          amenity: amenity,
          latitude: data.latitude,
          longitude: data.longitude,
          level: data.level,
          description: data.description,
          address: data.address,
          terms: data.terms,
          status: data.status == "true" ? true : false,
        },
      });
      return branch;
    });
    return res.status(201).send(result);
  } catch (error) {
    return res.status(400).send(error);
  } finally {
    await prisma.$disconnect();
  }
});

exports.branch_list = asyncHandler(async (req, res) => {
  const { pageNo, perPage } = await req.query;
  const reqUser = await req.user;
  const dataId = await ownerService.propertyBy(reqUser);
  let where = {};
  if (dataId != "all") {
    where = {
      ownerId: dataId,
    };
  }
  if (
    reqUser.userType == "BUSINESS_MANAGER" ||
    reqUser.userType == "LISTING_MANAGER"
  ) {

  }
  const perPg = perPage ? Number(perPage) : 10;
  const from = Number(pageNo * perPg) - Number(perPg);
  const [count, branches] = await prisma.$transaction([
    prisma.branch.count({ where }),
    prisma.branch.findMany({
      skip: pageNo ? from : 0,
      take: perPg,
      where,
      orderBy: {
        createdAt: "desc",
      },
      select:{
        id:true,branchName:true,propertyId:true,level:true,city:true,area:true,bookingCount:true,status:true
      }
    }),
  ]);

  return res.status(200).send({
    pagination: {
      total: Math.ceil(count / perPg),
    },
    data: branches,
  });
});

exports.get_branch = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const branch = await prisma.branch.findFirst({
    where: {
      id: id,
    },
    include: {
      property: { select: { id: true, listingName: true } },
    },
  });
  return res.status(200).send(branch);
});

exports.branch_update = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = await req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      let amenity = amenities?.map(itm => itm.name)
      const branch = await prisma.branch.update({
        where: {
          id: id
        },
        data: {
          branchName: data.branchName,
          propertyId: data.propertyId,
          country: data.country,
          city: data.city,
          area: data.area,
          location: data.location,
          amenities: data.amenities,
          amenity: amenity,
          latitude: data.latitude,
          longitude: data.longitude,
          level: data.level,
          description: data.description,
          address: data.address,
          terms: data.terms,
          status: data.status == "true" ? true : false,
          updatedAt:new Date(),
          updatedBy: req.user?.id
        },
      });
      return branch;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error);
  } finally {
    await prisma.$disconnect();
  }
});
exports.delete_branch = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const asset = await prisma.branch.update({
    where: {
      id: id,
    },
    data: {
      deletedAt: new Date(),
      updatedBy: req.user?.id
    },
  });
  return res.status(200).send(asset);
});
