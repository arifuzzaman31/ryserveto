const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");
const helper = require("../../helper/helper");
const ownerService = require("../../services/ownerService");

exports.create_emp_own = asyncHandler(async (req, res) => {
  const data = await req.body;
  const userId = await ownerService.propertyBy(req.user);
  const hashPass = await helper.bcryptHash(data.password);
  let preperData = {
    name: data.name,
    email: data.email,
    userType: data.userType,
    birthDate: data.birthDate ? new Date(data.birthDate): new Date(),
    country: data.country,
    city: data.city,
    phoneNumber: data.phoneNumber,
    occupation: data.occupation,
    designation: data.designation,
    password: hashPass,
    location: data.location,
    residenceAddress: data.residenceAddress,
    nid: data.nid,
    roleId: data.roleId,
    status: data.status == "true" ? true : false,
  };
  if (userId != "all") {
    preperData.ownerId = userId;
    // preperData.roleId = data.roleId;
  }
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const employee = await prisma.Owner.create({
        data: preperData,
      });
      return employee;
    });
    return res.status(201).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.emp_list = asyncHandler(async (req, res) => {
  const { pageNo, perPage, vendor } = req.query;
  const dataId = await ownerService.propertyBy(req.user);
  const where = {
    deletedAt: null
  };

  if (dataId !== "all") {
    where.ownerId = dataId;
  }

  if (vendor === "yes") {
    where.userType = "BUSINESS_OWNER";
  } else {
    where.userType = {
      notIn: ["BUSINESS_OWNER", "CRM_EDITOR"],
    };
  }
  const perPg = perPage ? Number(perPage) : 10;
  const from = Number(pageNo * perPg) - Number(perPg);

  const [count, employee] = await prisma.$transaction([
    prisma.Owner.count({
      where,
    }),
    prisma.Owner.findMany({
      skip: pageNo ? from : 0,
      take: perPg,
      where,
      orderBy: {
        createdAt: "desc",
      },
      select:{
        id:true,name:true,email:true,phoneNumber:true,userType:true,status:true,roleId:true,
        roles:{select:{
          id:true,roleName:true,
          branch: { select: { id: true, branchName: true }
          },
        }}
      }
    }),
  ]);

  res.send({
    pagination: {
      total: Math.ceil(count / perPg),
    },
    data: employee,
  });
});

exports.emp_get = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  try {
    const employee = await prisma.Owner.findUnique({
      where: {
        id: id,
      },
    });
    return res.status(200).send(employee);
  } catch (error) {
    return res.status(400).send(error);
  }
});

exports.emp_update = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  try {
    const data = await req.body;
    const result = await prisma.$transaction(async (prisma) => {
      const employee = await prisma.Owner.update({
        where: {
          id: id,
        },
        data: {
          name: data.name,
          email: data.email,
          userType: data.userType,
          country: data.country,
          city: data.city,
          phoneNumber: data.phoneNumber,
          occupation: data.occupation,
          designation: data.designation,
          location: data.location,
          residenceAddress: data.residenceAddress,
          nid: data.nid,
          roleId: data.roleId,
          ownerId: data.ownerId,
          status: data.status == "true" ? true : false,
          updatedAt:new Date(),
          updatedBy: req.user?.id
        },
      });
      return employee;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.delete_emp = asyncHandler(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  try {
    const employee = await prisma.Owner.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
        updatedBy: req.user?.id
      },
    });
    return res.status(200).send(employee);
  } catch (error) {
    return res.status(400).send(error);
  }
});
