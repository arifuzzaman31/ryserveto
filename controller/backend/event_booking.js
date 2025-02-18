const asyncHandler = require("express-async-handler");
const userService = require("../../services/userService");
const ownerService = require("../../services/ownerService");
const prisma = require("../../lib/db/prisma");
const helper = require("../../helper/helper");

exports.create_evt_booking = asyncHandler(async (req, res) => {
  try {
    const data = await req.body;
    const result = await prisma.$transaction(async (prisma) => {

      let createdUser = await userService.get_user({
        phoneNumber: data.user?.phoneNumber,
      });
      if (!createdUser) {
        const demoMail =
          data.user?.email ?? "user" + Math.floor(Math.random() * 10000) + "@fakemail.com";
        createdUser = await prisma.user.create({
          data: {
            email: demoMail,
            firstName: data.user?.firstName,
            lastName: data.user?.lastName,
            name: data.user?.firstName + " " + data.user?.lastName,
            phoneNumber: data.user?.phoneNumber,
            status: true,
            isVerify: false,
          },
        });
      }

      const event = await prisma.Events.findFirst({
        where: {
          id: data.eventId,
        }
      });
     
      const { id, name, email, phoneNumber } = createdUser;
      const bookingData = {
        customer: { connect: { id: id } },
        event: { connect: { id: data.eventId } },
        username: name,
        phoneNumber: phoneNumber,
        email: email,
        address: data.address,
        eventDate: new Date(event.startDate),
        person: data.person,
        ticketNumber: data.ticketNumber ?? '',
        price: data.price ?? 0,
        amount: data.amount ?? 0,
        vat: data.vat ?? 0,
        payStatus: data.payStatus ?? "UNPAID",
        bookingStatus: data.bookingStatus ?? "ON_HOLD",
        discount: data.discount ?? 0,
        // optionalData: data.menuData,
        issueAt: new Date(),
        customerRequest: data.customerRequest,
        status: true
      };
      // return res.status(200).send(bookingData);
      const booking = await prisma.Evbooking.create({
        data: bookingData,
      });
      if (booking) {
        let phone_number = "88" + phoneNumber;
        let message = "Thank you.\nYour Event Booking is Confirmed.";
        if (process.env.SMS_TO_USER == 'true') {
          await helper.runSMSservice(encodeURI(message), phone_number);
        }
      }
      return booking;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
});

exports.get_all_evt_booking = asyncHandler(async (req, res) => {
  const { pageNo, perPage, status, issueAt, keyword } = req.query;
  // const dataId = await ownerService.propertyBy(req.user);
  let where = {};
  // if (dataId != "all") {
  //   where.ownerId = dataId;
  // }
  // if (
  //   req.user.userType == "BUSINESS_MANAGER" ||
  //   req.user.userType == "LISTING_MANAGER"
  // ) {
  //   where.assetId = req.user.assetId;
  // }
  where.deletedAt = null;
  if (status) where.bookingStatus = status;
  // if (propertyId) where.propertyId = propertyId;
  // if (event) {
  //   if (event == "Regular") {
  //     where.bookingType = "Regular";
  //   } else {
  //     where.bookingType = {
  //       not: "Regular",
  //     };
  //   }
  // }
  if(keyword){
    where.OR = [
      { username: { contains: keyword, mode: "insensitive" } },
      { phoneNumber: { contains: keyword, mode: "insensitive" } },
      { event: { evtName: { contains: keyword, mode: "insensitive" } } }
    ];
  }
  if (issueAt) {
    where.issueAt =  new Date(issueAt);
  }
  // return res.status(200).send(where);
  const perPg = perPage ? Number(perPage) : 10;
  const from = Number(pageNo * perPg) - Number(perPg);
  const [count, bookings] = await prisma.$transaction([
    prisma.Evbooking.count({ where }),
    prisma.Evbooking.findMany({
      skip: pageNo ? from : 0,
      take: perPg,
      orderBy: {
        createdAt: "desc",
      },
      where,
      include: {
        event: {
          select: {
            id: true,
            evtName: true
          },
        },
      },
    }),
  ]);

  return res.status(200).send({
    pagination: {
      total: Math.ceil(count / perPg),
    },
    data: bookings,
  });
});

exports.get_evt_booking = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const booking = await prisma.Evbooking.findFirst({
    where: {
      id: id,
    },
  });
  return res.status(200).send(booking);
});

exports.update_evt_booking = asyncHandler(async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const result = await prisma.$transaction(async (prisma) => {
      const prevasset = await prisma.Evbooking.findFirst({
        where: { id: id },
        include: {
          event: {
            select: {
              id: true,
              evtName: true,
            },
          },
        },
      });
      const prepareData = { ...prevasset, ...data };
      prepareData.eventDate = data.eventDate ? new Date(data.eventDate): prepareData.eventDate
      prepareData.customerRequest = data.customerRequest ?? prepareData.customerRequest
      delete prepareData["id"];
      delete prepareData["customerId"];
      delete prepareData["optionalData"];
      delete prepareData["event"];
      delete prepareData["user"];
      delete prepareData["deletedAt"];
      // return res.status(200).send(prepareData);
      const booking = await prisma.Evbooking.update({
        where: {
          id: prevasset.id,
        },
        data: prepareData,
      });
      if (booking) {
        const customDate = await helper.formattedDate(booking.eventDate);
        let phone_number = "88" + prevasset.phoneNumber;
        let message;
        if (data.bookingStatus == "CONFIRMED" || data.bookingStatus == "CANCELED") {
          let text = data.bookingStatus.toLowerCase();
          message = `Reservation under ${prevasset.username} at ${prevasset.event?.evtName} is ${text} for ${customDate} .\nFor support, contact 01923283543`;
          if (process.env.SMS_TO_USER == 'true') {
            await helper.runSMSservice(encodeURI(message), phone_number);
          }
        }
      }
      return booking;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error);
  } finally {
    await prisma.$disconnect();
  }
});

exports.delete_evt_booking = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const booking = await prisma.Evbooking.update({
    where: {
      id: id,
    },
    data: {
      deleteAt: new Date(),
      updatedBy: req.user?.id
    },
  });
  return res.status(200).send(booking);
});
