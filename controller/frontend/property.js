const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");

exports.property_list = asyncHandler(async (req, res) => {
  const { pageNo, perPage, signature, group } = req.query;
  let where = {};
  if (signature) {
    where.sectSymb = parseInt(signature, 10);
  }
  if (group) {
    where.type = group;
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
        reservationCategory: true,
        branches: {
          select:{
            id:true,city:true,area:true,longitude:true,latitude:true,propertyId:true,location:true
          },
          take:1
        },
        status: true,
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

exports.search_list = asyncHandler(async (req, res) => {
  const grp = req.params.group;
  let data = null;
  switch (grp.toUpperCase()) {
    case "HOTEL":
      break;
    case "RESTAURANT":
      data = await getProperty(grp.toUpperCase(), req.query);
      break;
    case "SERVICE_APARTMENT":
      break;
    case "MOVIE_THEATER":
      break;
    case "SPA":
      break;
    case "EVENTS":
      data = await getProperty(grp.toUpperCase(), req.query);
      break;
    case "BY-BRANCH":
      data = await getBranchByProperty("RESTAURANT", req.query);
      break;
    default:
      data = { status: false, message: "No Data Found!" };
      break;
  }
  return res.status(200).send(data);
});

exports.get_property = asyncHandler(async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const property = await prisma.Property.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        type: true,
        listingName: true,
        title: true,
        subTitle: true,
        logo: true,
        cuisines: true,
        slot: true,
        images: true,
        description: true,
        terms: true,
        offday: true,
        position: true,
        status: true,
        eventStatus: true,
        optionalData: true,
        event:{select:{id:true}},
        branches: {
          select: {
            id: true,
            propertyId: true,
            branchName: true,
            images: true,
            description: true,
            level: true,
            terms: true,
            city: true,
            area: true,
            country: true,
            amenities: true,
            latitude: true,
            longitude: true,
            location: true,
            address: true,
            status: true,
            longitude: true,
            tables: {
              select: {
                id: true,
                branchId: true,
                type: true,
                capacity: true,
                position: true,
                size: true,
                image: true,
                ryservable: true,
                status: true,
              },
            },
          },
          // take:1
        },
        food: {
          select: {
            id: true,
            name: true,
            images: true,
            propertyId: true,
            price: true,
            description: true,
            status: true,
          },
        },
      },
    });
    return res.status(200).send(property);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

exports.get_branch_property = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const property = await prisma.Branch.findFirst({
    where: {
      id: id,
    },
    select: {
      id: true,
      propertyId: true,
      branchName: true,
      images: true,
      description: true,
      level: true,
      terms: true,
      city: true,
      area: true,
      country: true,
      amenities: true,
      latitude: true,
      longitude: true,
      location: true,
      address: true,
      status: true,
      longitude: true,
      property: {
        select: {
          id: true,
          type: true,
          listingName: true,
          title: true,
          subTitle: true,
          logo: true,
          cuisines: true,
          slot: true,
          images: true,
          description: true,
          terms: true,
          offday: true,
          position: true,
          status: true,
          optionalData: true,
          food: {
            select: {
              id: true,
              name: true,
              images: true,
              propertyId: true,
              status: true,
            },
          },
        },
      },
      tables: {
        select: {
          id: true,
          branchId: true,
          type: true,
          capacity: true,
          position: true,
          size: true,
          image: true,
          ryservable: true,
          status: true,
        },
      },
    },
  });
  return res.status(200).send(property);
});

exports.branch_property = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const property = await prisma.branch.findFirst({
    where: {
      id: id,
    },
    select: {
      id: true,
      propertyId: true,
      branchName: true,
      images: true,
      description: true,
      level: true,
      terms: true,
      city: true,
      area: true,
      country: true,
      amenities: true,
      latitude: true,
      longitude: true,
      location: true,
      address: true,
      status: true,
      longitude: true,
      tables: {
        select: {
          id: true,
          branchId: true,
          type: true,
          capacity: true,
          position: true,
          size: true,
          image: true,
          ryservable: true,
          status: true,
        },
      },
      property: {
        select: {
          id: true,
          type: true,
          listingName: true,
          title: true,
          subTitle: true,
          logo: true,
          cuisines: true,
          slot: true,
          images: true,
          description: true,
          terms: true,
          offday: true,
          position: true,
          optionalData: true,
          status: true,
          food: {
            select: {
              id: true,
              name: true,
              images: true,
              propertyId: true,
              status: true,
            },
          },
        },
      },
    },
  });
  return res.status(200).send(property);
});

exports.property_food = asyncHandler(async (req, res) => {
  const { group } = req.query;
  const id = parseInt(req.params.id, 10);
  const property_food = await prisma.Property.findFirst({
    where: {
      id: id,
      type: group,
    },
    select: {
      id: true,
      type: true,
      listingName: true,
      title: true,
      subTitle: true,
      logo: true,
      cuisines: true,
      status: true,
      food: {
        select: {
          id: true,
          name: true,
          images: true,
          propertyId: true,
          price: true,
          description: true,
          status: true,
        },
      },
    },
  });
  return res.status(200).send(property_food);
});

exports.branch_list_property = asyncHandler(async (req, res) => {
  const area = req.params.area;
  const { group, signature } = req.query;
  const pageNo = parseInt(req.query.pageNo) || 1;
  const perPage = parseInt(req.query.perPage) || 15;
  let where = {};
  // if (area) {
  //   where.OR = {area: {
  //     contains: area,
  //     mode: "insensitive",
  //   }};
  // }
  let orConditions = [];
  if (signature) {
    orConditions.push({ property: { is: { sectSymb: Number(signature) } } });
  }

  if (area) {
    orConditions.push({ area: { contains: area, mode: "insensitive" } });
  }
  if (group) {
    orConditions.push({ property: { type: group } });
  }
  if (orConditions.length > 0) {
    if (!area && group && signature) {
      where.AND = orConditions;
    } else {
      where.OR = orConditions;
    }
  }
  // return res.status(200).send({where})
  const from = Number(pageNo * perPage) - Number(perPage);
  const [count, branches] = await prisma.$transaction([
    prisma.branch.count({ where }),
    prisma.branch.findMany({
      skip: pageNo ? from : 0,
      take: perPage,
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        branchName: true,
        propertyId: true,
        images: true,
        level: true,
        city: true,
        area: true,
        bookingCount: true,
        longitude: true,
        latitude: true,
        status: true,
        property: {
          select: {
            id: true,
            type: true,
            listingName: true,
            logo: true,
            images: true,
            reservationCategory: true,
            sectSymb: true,
            optionalData: true,
            status: true,
          },
        },
      },
    }),
  ]);

  return res.status(200).send({
    pagination: {
      total: Math.ceil(count / perPage),
    },
    data: branches,
  });
});

async function getProperty(tp, query) {
  const { pageNo, perPage } = query;
  let where = await whereMaker(tp,query);
  // return {where}; p6PdBMH]z_5r concord
  const perPg = perPage ? Number(perPage) : 10;
  const from = Number(pageNo * perPg) - Number(perPg);
  const bwhere = {}
  if(query.area){
    bwhere.area = query.area
  }
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
        branches: {
          where:{...bwhere},
          select:{
            id:true,city:true,area:true,longitude:true,latitude:true,propertyId:true,location:true
          },
          take:3
        },
        status: true,
        tables: { select: { id: true, position: true, capacity: true } },
        booking: { select: { id: true, startDate: true, slot: true } },
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

async function getBranchByProperty(tp, query) {
  const { pageNo, perPage } = query;
  let where = await whereBranchMaker(query);
  // return {where};
  const perPg = perPage ? Number(perPage) : 10;
  const from = Number(pageNo * perPg) - Number(perPg);

  const [count, branches] = await prisma.$transaction([
    prisma.branch.count({ where }),
    prisma.branch.findMany({
      skip: Number(pageNo) ? from : 0,
      take: Number(perPg),
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        branchName: true,
        propertyId: true,
        images: true,
        level: true,
        city: true,
        area: true,
        longitude: true,
        latitude: true,
        status: true,
        property: {
          select: {
            id: true,
            type: true,
            listingName: true,
            logo: true,
            images: true,
            cuisines: true,
            reservationCategory: true,
            sectSymb: true,
            status: true,
          },
        },
        tables: {
          select: {
            id: true,
            branchId: true,
            propertyId: true,
            capacity: true,
            position: true,
            status: true,
          },
        },
        booking: {
          select: {
            id: true,
            branchId: true,
            propertyId: true,
            startDate: true,
            endDate: true,
            slot: true,
            status: true,
          },
        },
      },
    }),
  ]);
  return {
    pagination: {
      total: Math.ceil(count / perPg),
    },
    data: branches,
  };
}

async function whereBranchMaker(query) {
  const { date, position, seating, cuisine } = query;
  let where = {};
  let orConditions = [];
  if (position) {
    let pos = parseInt(position, 10);
    orConditions.push({ property: { position: pos } });
  }
  if (cuisine) {
    const cuisine_arr = cuisine.split("_");
    orConditions.push({ property: { cuisines: { hasSome: cuisine_arr } } });
  }
  if (seating) {
    orConditions.push({ tables: { some: { position: seating } } });
  }
  if (date) {
    orConditions.push({ booking: { none: { startDate: new Date(date) } } });
  }
  if (orConditions.length > 0) {
    where.OR = orConditions;
  }
  return where;
}

async function whereMaker(tp,query) {
  const { date, position, seating, cuisine, area, byName } = query;
  let where = {};
  if (cuisine) {
    const cuisine_arr = cuisine.split("_");
    where.cuisines = { hasSome: cuisine_arr };
  }
  if (byName) {
    where.listingName = { 
      contains: byName,
      mode: 'insensitive'
    };
  }
  let orConditions = [];
  if (position) {
    let pos = parseInt(position, 10);
    if (where.length > 0) {
      orConditions.push({ position: pos });
      where.OR = orConditions;
    } else {
      where.position = pos;
    }
  }
  if (tp) {
    if (where.length > 0) {
      orConditions.push({ type: tp });
      where.OR = orConditions;
    } else {
      where.type = tp;
    }
  }
  if (seating) {
    if (where.length > 0) {
      orConditions.push({ tables: { some: { position: seating } } });
      where.OR = orConditions;
    } else {
      where.tables = { some: { position: seating } };
    }
  }

  if (date) {
    if (where.length > 0) {
      orConditions.push({ booking: { none: { startDate: new Date(date) } } });
      where.OR = orConditions;
    } else {
      where.booking = { none: { startDate: new Date(date) } };
    }
  }
  if (area) {
    if (where.length > 0) {
      orConditions.push({ branches: { some: { area: area } } });
      where.OR = orConditions;
    } else {
      where.branches = { some: { area: area } };
    }
  }
  return where;
}
