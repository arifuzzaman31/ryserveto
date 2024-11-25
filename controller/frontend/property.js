const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");

exports.property_list = asyncHandler(async(req,res) => {
    const {pageNo,perPage,signature,group,type } = req.query;
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

exports.search_list = asyncHandler(async(req,res) => {
    const grp = req.params.group;
    let data;
    switch (grp.toUpperCase()) {
      case "HOTEL":

        break;
      case "RESTAURANT":
            data = await getProperty('RESTAURANT',req.query)
        break;
      case "SERVICE_APARTMENT":
        
        break;
      case "MOVIE_THEATER":
        
        break;
      case "SPA":
        
        break;
      default:
        break;
    }
    return res.status(200).send(data)
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
      slot:true,
      status:true,
      branches: {
        select:{
          id:true,
          propertyId:true,
          branchName:true,
          images:true,
          description:true,
          level:true,
          terms:true,
          city:true,
          area:true,
          country:true,
          amenities:true,
          latitude:true,
          longitude:true,
          location:true,
          address:true,
          status:true,
          longitude:true,
          tables:{
            select:{
              id:true,
              branchId:true,
              type:true,
              capacity:true,
              position:true,
              size:true,
              image:true,
              ryservable:true,
              status:true
            }
          }
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
  const {group} = req.query;
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

async function getProperty(tp,query){
  const {pageNo,perPage,date,position,seating,cuisine } = query;
  // query.map();
  let where = {};
    if (cuisine) {
      const cuisine_arr = cuisine.split('_');
      where.cuisines = { hasSome: cuisine_arr };
    }
    let orConditions = [];
    if (position) {
      let pos = parseInt(position,10);
      orConditions.push({position:pos});
      where.OR = orConditions;
    }
    if (seating) {
      orConditions.push({ tables: { some: { capacity: {gte:Number(seating)} } } });
      where.OR = orConditions;
    }

    // if (orConditions.length > 0) {
    //   where.OR = orConditions;
    // }
    // return where
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
        position: true,
        reservationCategory: true,
        // branches: true,
        status: true,
        tables:{ select : {id:true,position:true,capacity:true}}
      },
    }),
  ]);

  return {
    pagination: {
      total: Math.ceil(count / perPg),
    },
    data: property,
  };
}