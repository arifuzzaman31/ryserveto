const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");
const ownerService = require("../../services/ownerService");

exports.create_role = asyncHandler(async (req, res) => {
  const data = await req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const role = await prisma.RolePermission.create({
        data: {
          branchId: data.branchId,
          roleName: data.roleName,
          permissions: data.permissions,
          status: data.status == "true" ? true : false,
        },
      });
      return role;
    });
    return res.status(201).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.role_list = asyncHandler(async (req, res) => {
  const { status, pageNo, perPage, noPaginate } = await req.query;
  const dataId = await ownerService.propertyBy(req.user);
  let where = {};
  if (dataId != "all") {
    where.branch = {
        ownerId: dataId,
    };
  }
  if (status) {
    where.status = true;
  }
  let skip = pageNo ? Number(pageNo * perPage) - Number(perPage) : 0;
  let take = perPage ? Number(perPage) : 10;
  const [count, roles] = await prisma.$transaction([
    prisma.RolePermission.count({ where }),
    prisma.RolePermission.findMany({
      ...(noPaginate == "yes" ? {} : { skip: skip, take: take }),
      where,
      orderBy: {
        createdAt: "desc",
      },
      select:{
        id:true,
        roleName:true,
        permissions:true,
        branchId:true,
        status:true,
        branch:{
          select:{
            id:true, branchName:true,ownerId:true
          }
        },
      }
    }),
  ]);

  return res.status(200).send({
    pagination: {
      total: Math.ceil(count / take),
    },
    data: roles,
  });
});

exports.update_role = asyncHandler(async (req, res) => {
  const data = await req.body;
  try {
    const id = parseInt(req.params.id, 10);
    const result = await prisma.$transaction(async (prisma) => {
      const roles = await prisma.RolePermission.update({
        where: {
          id: id,
        },
        data: {
          branchId: data.branchId,
          roleName: data.roleName,
          permissions: data.permissions,
          status: data.status == "true" ? true : false,
          updatedAt:new Date(),
          updatedBy: req.user?.id
        },
      });
      return roles;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.get_role = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const roles = await prisma.RolePermission.findMany({
    where: {
      id: id,
    },
  });
  return res.status(200).send(roles);
});

exports.delete_role = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const roles = await prisma.RolePermission.update({
    where: {
      id: id,
    },
    data: {
      deletedAt: new Date(),
      updatedBy: req.user?.id
    },
  });
  return res.status(200).send(roles);
});
