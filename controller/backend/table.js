const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");

exports.create_table = asyncHandler(async (req, res) => {
  const data = await req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const table = await prisma.table.createMany({
        data: data
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
  const { propertyId, reservationCategory, branchId } = req.query;
  try {
    let condition = {}
    if(propertyId){
      condition.propertyId = parseInt(propertyId,10)
    }
    if(branchId){
      condition.branchId = parseInt(branchId,10)
    }
    const tables = await prisma.Table.findMany({
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
            // slot: true,
            reservationCategory: true,
          },
        },
      },
    });
    return res.status(200).send(tables);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

exports.get_table = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const table = await prisma.Table.findMany({
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
          capacity: data.capacity,
          position: data.position,
          size: data.size,
          image: data.image,
          splitable: data.splitable,
          ryservable: data.ryservable,
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
