const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");

exports.create_table = asyncHandler(async (req, res) => {
  const data = await req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const branch = await prisma.branch.findFirst({
        where: {
          id: data.branchId,
        },
      });
      const table = await prisma.table.create({
        data: {
          propertyId:branch.propertyId,
          branchId: data.branchId,
          capacity: data.capacity,
          type: data.type,
          position: data.position,
          image: data.image,
          size: data.size,
          splitable: data.splitable == "true" ? true : false,
          ryservable: data.ryservable == "true" ? true : false,
          status: data.status == "true" ? true : false,
        }
      });
      return table;
    });
    return res.status(201).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.table_list = asyncHandler(async (req, res) => {
  const { propertyId, reservationCategory, branchId,pageNo, perPage } = req.query;
  try {
    let condition = {}
    if(propertyId){
      condition.propertyId = parseInt(propertyId,10)
    }
    if(branchId){
      condition.branchId = parseInt(branchId,10)
    }
  const perPg = perPage ? Number(perPage) : 10;
  const from = Number(pageNo * perPg) - Number(perPg);

  const [count, tables] = await prisma.$transaction([
    prisma.Table.count({ where: {...condition} }),
    prisma.Table.findMany({
      skip: pageNo ? from : 0,
      take: perPg,
      where: {
        ...condition,
        property: {
          reservationCategory: reservationCategory,
        },
      },
      include: {
        property: {
          select: {
            id: true,
            listingName: true,
            reservationCategory: true,
          },
        },
        branch: {
          select: {
            id: true,
            branchName: true,
          },
        },
      },
    }),
  ]);
    return res.status(200).send({
      pagination: {
        total: Math.ceil(count / perPg),
      },
      data: tables,
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

exports.get_table = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const table = await prisma.Table.findFirst({
    where: {
      id: id,
    },
    include: {
      property: {
        select: {
          id: true,
          listingName: true,
          reservationCategory: true,
        },
      },
      branch: {
        select: {
          id: true,
          branchName: true,
          area: true,
        },
      },
    },
  });
  return res.status(200).send(table);
});

exports.table_update = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = await req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const table = await prisma.Table.update({
        where: {
          id: id,
        },
        data: {
          type: data.type,
          capacity: Number(data.capacity) || 0,
          position: data.position,
          size: data.size,
          image: data.image,
          splitable: data.splitable == "true" ? true : false,
          ryservable: data.ryservable == "true" ? true : false,
          status: data.status == "true" ? true : false,
          updatedAt:new Date(),
          updatedBy: req.user?.id
        },
      });
      return table;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});
exports.delete_table = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const table = await prisma.table.update({
    where: {
      id: id,
    },
    data: {
      deletedAt: new Date(),
      updatedBy: req.user?.id
    },
  });
  return res.status(200).send(table);
});
