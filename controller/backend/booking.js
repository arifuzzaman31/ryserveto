const asyncHandler = require("express-async-handler");
const userService = require("../../services/userService");
const ownerService = require("../../services/ownerService");
const prisma = require("../../lib/db/prisma");
const helper = require("../../helper/helper");

exports.create_booking = asyncHandler(async (req, res) => {
  try {
    const data = await req.body;
    const result = await prisma.$transaction(async (prisma) => {
      const chkBooking = await prisma.booking.findFirst({
        where: {
          propertyId: data.propertyId,
          tableId: data.tableId,
          branchId: data.branchId,
          startDate: new Date(data.startDate),
          slot: data.slot,
        },
      });
      if (chkBooking) {
        throw new Error("This Slot Already Booked!");
      }
      let createdUser = await userService.get_user({
        phoneNumber: data.user?.phoneNumber,
      });
      if (!createdUser) {
        const demoMail =
          "user" + Math.floor(Math.random() * 10000) + "@fakemail.com";
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

      const property = await prisma.property.findFirst({
        where: {
          id: data.propertyId,
        },
        include: {
          owner: {
            select: { id: true, phoneNumber: true },
          },
        },
      });
     
      const { id, name, phoneNumber } = createdUser;
      const bookingData = {
        property: { connect: { id: property.id } },
        branch: { connect: { id: data.branchId } },
        owner: { connect: { id: property.ownerId } },
        table: { connect: { id: data.tableId } },
        customer: { connect: { id: id } },
        customerName: name ?? data.user.lastName,
        phoneNumber: phoneNumber ?? data.user.phoneNumber,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        slot: data.slot,
        guestNumber: data.guestNumber ?? 1,
        amount: data.amount ?? 0,
        vat: data.vat ?? 0,
        discount: data.discount ?? 0,
        grandTotal: data.grandTotal ?? 0,
        status: data.status ?? "CONFIRMED",
        customerRequest: data.customerRequest ?? ''
      };
      // return res.status(200).send(bookingData);
      const booking = await prisma.Booking.create({
        data: bookingData,
      });
      if (booking) {
        let phone_number = "88" + phoneNumber;
        let message = "Thank you.\nYour reservation is Confirmed.";
        if (process.env.SMS_TO_USER == 'true') {
          await helper.runSMSservice(encodeURI(message), phone_number);
        }
        await prisma.Branch.update({
          where: { id: booking.branchId },
          data: {
            bookingCount: {
              increment: 1,
            },
          },
        });
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

exports.get_all_booking = asyncHandler(async (req, res) => {
  const { pageNo, perPage, status, event, startDate, endDate, propertyId, keyword } = req.query;
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
  if (status) where.status = status;
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
      { customerName: { contains: keyword, mode: "insensitive" } },
      { phoneNumber: { contains: keyword, mode: "insensitive" } },
      { property: { listingName: { contains: keyword, mode: "insensitive" } } }
    ];
  }
  if (startDate && endDate) {
    where.startDate = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }
  const perPg = perPage ? Number(perPage) : 10;
  const from = Number(pageNo * perPg) - Number(perPg);
  const [count, bookings] = await prisma.$transaction([
    prisma.Booking.count({ where }),
    prisma.Booking.findMany({
      skip: pageNo ? from : 0,
      take: perPg,
      orderBy: {
        createdAt: "desc",
      },
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
        customer: {
          select: {
            id: true,
            // name: true,
            // phoneNumber: true,
          },
        },
        property: {
          select: {
            id: true,
            listingName: true,
            type: true,
            reservationCategory: true,
          },
        },
        table: {
          select: {
            id: true,
            capacity: true,
            type: true,
            size: true,
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

exports.get_booking = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const booking = await prisma.Booking.findFirst({
    where: {
      id: id,
    },
  });
  return res.status(200).send(booking);
});

exports.update_booking = asyncHandler(async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const result = await prisma.$transaction(async (prisma) => {
      const prevasset = await prisma.Booking.findFirst({
        where: { id: id },
        include: {
          property: {
            select: {
              id: true,
              listingName: true,
            },
          },
        },
      });
      if (data.status == "COMPLETED" && prevasset.endDate > new Date()) {
        throw new Error("The completion status is not allowed because the reservation date has not yet ended.!");
      }
      const prepareData = { ...prevasset, ...data };
      (prepareData.startDate = data.startDate
        ? new Date(data.startDate)
        : prepareData.startDate),
        (prepareData.endDate = data.endDate
          ? new Date(data.endDate)
          : prepareData.endDate);
      if (data.tableId) {
        prepareData.tableId = data.tableId;
        if (data.status == "CONFIRMED" && prevasset.endDate > new Date()) {
          const chkBooking = await prisma.booking.findFirst({
            where: {
              propertyId: prevasset.propertyId,
              tableId: data.tableId,
              startDate: prevasset.startDate,
              slot: data.slot,
            },
          });
          if (chkBooking) {
            throw new Error("This Slot Already Assigned in this Time!");
          }
        }
      }
      delete prepareData["id"];
      delete prepareData["createdAt"];
      delete prepareData["property"];
      delete prepareData["deletedAt"];
      // return res.status(200).send(prepareData);
      const booking = await prisma.Booking.update({
        where: {
          id: prevasset.id,
        },
        data: prepareData,
      });
      if (booking) {
        const customDate = await helper.formattedDate(booking.startDate);
        let phone_number = "88" + prevasset.phoneNumber;
        let message;
        if (data.status == "CONFIRMED" || data.status == "CANCELED") {
          let text = data.status.toLowerCase();
          message = `Reservation under ${prevasset.customerName} at ${prevasset.property.listingName} is ${text} for ${customDate} at ${booking.slot}.\nFor support, contact 01923283543`;
          if (process.env.SMS_TO_USER == 'true') {
            await helper.runSMSservice(encodeURI(message), phone_number);
          }
        }
        if (data.slot != prevasset.slot) {
          message = `Your reservation slot is updated from ${prevasset.slot} to ${data.slot}.\nFor support, contact 01923283543`;
          if (process.env.SMS_TO_USER == 'true') {
            await helper.runSMSservice(encodeURI(message), phone_number);
          }
        }
      }
      return booking;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
});

exports.delete_booking = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const booking = await prisma.Booking.update({
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
