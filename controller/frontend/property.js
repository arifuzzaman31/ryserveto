const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");

exports.property_list = asyncHandler(async(req,res) => {
    const {pageNo,perPage,signature,group,type } = await req.query;
    let where = {
        sectSymb:parseInt(signature,10),
        type:group
    };
    let include = {}
    if(type=='FOOD'){
        where.id = parseInt(signature,10)
        include.food = {
            select: {
                id:true,
                name:true,
                images:true,
                propertyId:true,
                status:true
            }
        }
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
    //   include,
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