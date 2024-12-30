const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");

exports.event_list = asyncHandler(async (req, res) => {
    const { pageNo, perPage, signature, group } = req.query;
    let where = {};
    let orCondition = []
    if (signature) {
        where.property = {sectSymb:parseInt(signature, 10)};
    }
    if (group) {
        orCondition.push({property:{type:group}});
    }
    if(orCondition.length > 0){
        where.OR = orCondition
    }
    // return res.status(200).send({where})
    const perPg = perPage ? Number(perPage) : 10;
    const from = Number(pageNo * perPg) - Number(perPg);
  
    const [count, event] = await prisma.$transaction([
      prisma.Events.count({ where }),
      prisma.Events.findMany({
        skip: pageNo ? from : 0,
        take: perPg,
        where,
        orderBy: {
          createdAt: "desc",
        },
        select: {
            id:true,
            propertyId: true,
            branchId: true,
            evtName:true,
            slug: true,
            title:true,
            subtitle: true,
            location: true,
            images: true,
            mapLocation:true,
            latitude:true,
            longitude:true,
            address:true,
            property:{
              select:{
                id:true,
                listingName:true,
                sectSymb:true,
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
        },
      }),
    ]);
  
    return res.status(200).send({
      pagination: {
        total: Math.ceil(count / perPg),
      },
      data: event,
    });
});

exports.get_event = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id,10);
    const event = await prisma.Events.findFirst({
        where:{
          id:id
        },
        select: {
            id:true,
            propertyId: true,
            branchId: true,
            evtName:true,
            slug: true,
            title:true,
            subtitle: true,
            images: true,
            location: true,
            mapLocation:true,
            latitude:true,
            longitude:true,
            address:true,
            property:{
              select:{
                id:true,
                listingName:true,
                sectSymb:true,
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
        },
      });
    return res.status(200).send(event);
});

exports.event_booking = asyncHandler(async (req, res) => {
  const data = req.body;
  const { id } = req.user;
  try {
    const bookingData = {
      customer: { connect: { id: id } },
      event: { connect: { id: data.eventId } },
      username: data.username,
      phoneNumber: data.phoneNumber,
      email: data.email,
      address: data.address,
      eventDate: new Date(data.startDate),
      issueAt: new Date(data.issueAt),
      person: data.person,
      ticketNumber: data.ticketNumber ?? "XYZ32584",
      price: data.price ?? 0,
      amount: data.amount ?? 0,
      vat: data.vat ?? 0,
      payStatus: data.payStatus ?? "UNPAID",
      bookingStatus: data.payStatus ?? "ON_HOLD",
      discount: data.discount ?? 0,
      optionalData: data.menuData,
      status: data.status == 'true' ? true : false
    };
    const booking = await prisma.Evbooking.create({
        data: bookingData,
      });
    return res.status(200).send(booking);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});