const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");
const helper = require("../../helper/helper");

exports.create_event = asyncHandler(async (req, res) => {
  const data = await req.body;
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
    const { status } = await req.query;
    let where = {};
    if (status) {
      where = {
        status: true,
      };
    }
    const event = await prisma.Events.findMany({
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