const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");
const helper = require("../../helper/helper");

exports.create_event = asyncHandler(async (req, res) => {
  const data = req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const events = await prisma.Events.create({
        data: {
            propertyId: data.propertyId,
            branchId: data.branchId,
            evtName: data.evtName,
            slug: helper.slugify(data.evtName),
            images: data.images,
            title: data.title,
            subtitle: data.subtitle,
            location: data.location,
            mapLocation: data.mapLocation,
            address: data.address,
            images: data.images,
            capacity: Number(data.capacity),
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            rules: data.rules,
            description: data.description,
            optionalData: data.optionalData,
            status: data.status == "true" ? true : false,
        },
      });
      await prisma.property.update({
        where:{
          id: data.propertyId
        },
        data:{
          eventStatus: true
        }
      });
      return events;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.event_list = asyncHandler(async (req, res) => {
    const { pageNo, perPage, status } = req.query;
    let where = {};
    if (status) {
      where = {
        status: true,
      };
    }
    const perPg = perPage ? Number(perPage) : 10;
    const from = Number(pageNo * perPg) - Number(perPg);
    const event = await prisma.Events.findMany({
      skip: pageNo ? from : 0,
      take: perPg,
      orderBy: {
        createdAt: "desc",
      },
      where,
      select:{
        id:true,
        propertyId: true,
        branchId: true,
        evtName:true,
        slug: true,
        title:true,
        subtitle: true,
        location: true,
        mapLocation:true,
        address:true,
        property:{
          select:{
            id:true,
            listingName:true,
            type:true,
            logo:true,
            images:true,
          }
        },
        branch:{
          select:{
            id:true,
            branchName:true,
            images:true,
            area:true,
            city:true,
            country:true,
            latitude:true,
            longitude:true
          }
        }
      }
    });
    return res.status(200).send(event);
});

exports.event_update = asyncHandler(async (req, res) => {
  const data = req.body;
  const id = parseInt(req.params.id,10);
  try {
    const prevasset = await prisma.Events.findFirst({
      where: {
        id: id,
      },
    });
    const prepareData = { ...prevasset, ...data };
    prepareData.startDate = data.startDate ? new Date(data.startDate) : prevasset.startDate;
    prepareData.endDate = data.endDate ? new Date(data.endDate) : prevasset.endDate;
    prepareData.slug = data.evtName ?  helper.slugify(data.evtName) : prevasset.slug;
    prepareData.status = data.status == "true" ? true : false;
    prepareData.updatedBy = req.user?.id;
    prepareData.updatedAt = new Date();

    delete prepareData["id"];
    delete prepareData["createdAt"];
    delete prepareData["deletedAt"];
    const result = await prisma.$transaction(async (prisma) => {
      const event = await prisma.Events.update({
        where:{
          id:id
        },
        data:prepareData,
      });
      return event;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.get_event = asyncHandler(async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const event = await prisma.Events.findFirst({
      where: {
        id: id,
      },
      select:{
        id:true,
        propertyId: true,
        branchId: true,
        evtName:true,
        slug: true,
        title:true,
        subtitle: true,
        location: true,
        mapLocation:true,
        address:true,
        property:{
          select:{
            id:true,
            listingName:true,
            type:true,
            logo:true,
            images:true,
          }
        },
        branch:{
          select:{
            id:true,
            branchName:true,
            images:true,
            area:true,
            city:true,
            country:true,
            latitude:true,
            longitude:true
          }
        }
      }
    });
    return res.status(200).send(event);
  } catch (error) {
    return res.status(400).send(error);
  }
});

exports.delete_event = asyncHandler(async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const event = await prisma.Events.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return res.status(200).send(event);
  } catch (error) {
    return res.status(400).send(error);
  }
});