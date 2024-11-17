const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");

exports.property_list = asyncHandler(async(req,res) => {
    const {pageNo,perPage,signature,group,type } = await req.query;
    let where = {};
    if(signature){where.sectSymb = parseInt(signature,10)}
    if(type){ where.type = group }
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
        reservationCategory: true,
        // branches: true,
        status: true
        // tables: true
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

exports.get_property = asyncHandler(async(req,res) => {
  const id = parseInt(req.params.id, 10);
  const property = await prisma.Property.findFirst({
    where: {
      id: id
    },
    select: {
      id:true,
      type:true,
      listingName:true,
      title:true,
      subTitle:true,
      logo:true,
      cuisines:true,
      status:true,
      branches: {
        include:{
          tables:true
        }
      },
      food: { 
        select: { 
          id:true,
          name:true,
          images:true,
          propertyId:true,
          status:true 
        } 
      },
    },
  });
  return res.status(200).send(property);
});

exports.property_food = asyncHandler(async(req,res) => {
  const {group} = await req.query;
  const id = parseInt(req.params.id, 10);
  const property_food = await prisma.Property.findFirst({
    where: {
      id: id,
      type: group,
    },
    select: {
      id:true,
      type:true,
      listingName:true,
      title:true,
      subTitle:true,
      logo:true,
      cuisines:true,
      status:true,
      food: { 
        select: { 
          id:true,
          name:true,
          images:true,
          propertyId:true,
          status:true 
        } 
      },
    },
  });
  return res.status(200).send(property_food);
});