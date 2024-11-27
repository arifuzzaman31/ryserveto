const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");

exports.property_list = asyncHandler(async (req, res) => {
  const { pageNo, perPage, signature, group, type } = req.query;
  let where = {};
  if (signature) {
    where.sectSymb = parseInt(signature, 10);
  }
  if (type) {
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
        // branches: true,
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
      data = await getProperty("RESTAURANT", req.query);
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
  return res.status(200).send(data);
});

exports.get_property = asyncHandler(async (req, res) => {
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
      },
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
          status: true,
          food: {
            select: {
              id: true,
              name: true,
              images: true,
              propertyId: true,
              status: true,
            },
          }
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
  if (area) {
    where.area = {
      contains: area,
      mode: "insensitive",
    };
  }
  let orConditions = [];
  if (signature) {
    if(where.length > 0){
      orConditions.property.push({is:{sectSymb : signature}});
    } else {
      where.property = {is: {sectSymb : signature}};
    }
  }
  if (group) {
    if(where.length > 0){
      orConditions.property.push({type : group});
    } else {
      where.property = {type : group};
    }
  }
  if(orConditions.length > 0) where.OR = orConditions
  return res.status(200).send(where)
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
  let where = await whereMaker(query);
  // return where;
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

async function whereMaker(query) {
  const { date, position, seating, cuisine } = query;
  let where = {};
  if (cuisine) {
    const cuisine_arr = cuisine.split("_");
    where.cuisines = { hasSome: cuisine_arr };
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
  return where;
}
