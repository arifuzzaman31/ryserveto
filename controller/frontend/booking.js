const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");
const helper = require("../../helper/helper");

exports.create_booking = asyncHandler(async (req, res) => {
  const data = req.body;
  try {
    const branch = await prisma.Branch.findFirst({
      where: {
        id: data.branchId
      },
      include: {
        owner: {
          select: { id: true, phoneNumber: true },
        },
        property: {
          select: { id: true, listingName: true },
        },
      },
    });

    const { id, name, phoneNumber } = req.user;
    const bookingData = {
      property: { connect: { id: branch.propertyId } },
      branch: { connect: { id: branch.id } },
      owner: { connect: { id: branch.ownerId } },
      customer: { connect: { id: id } },
      customerName: name,
      phoneNumber: phoneNumber,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      slot: data.slot,
      guestNumber: data.guestNumber ?? 0,
      amount: data.amount ?? 0,
      vat: data.vat ?? 0,
      discount: data.discount ?? 0,
      optionalData: data.menuData,
      grandTotal: data.grandTotal ?? 0,
      customerRequest: data.customerReq,
      bookingType: data.bookingType ?? "Regular",
      status: data.status ?? "ON_HOLD"
    };
    if (data.tableId) {
      bookingData.table = { connect: { id: data.tableId } };
    }
    if (data.seatBedId) {
      bookingData.seatBed = { connect: { id: data.seatBedId } };
    }
    const result = await prisma.$transaction(async (prisma) => {
      const booking = await prisma.Booking.create({
        data: bookingData,
      });
      if (booking) {
        let phone_number = "88" + req.user?.phoneNumber;
        let message = `Your reservation is pending confirmation from ${branch.property?.listingName}.\nFor support, contact 01923283543`;
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

exports.booking_list = asyncHandler(async (req, res) => {
  const { from, to } = await req.query;
  const bookings = await prisma.Booking.findMany({
    skip: Number(from) ? Number(from) : 0,
    take: Number(to) ? Number(to) : 5,
    where: {
      customerId: req.user.id,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    select:{
      id:true,
      propertyId:true,
      branchId:true,
      startDate:true,
      slot:true,
      guestNumber:true,
      status:true,
      property: {
        select: {
          id: true,
          listingName: true,
          title: true,
          subTitle: true,
          logo: true,
          images: true
        },
      },
      branch: {
        select: {
          id: true,
          branchName: true,
          images: true,
          city: true,
          area: true,
          latitude: true,
          longitude: true,
          country: true,
        },
      },
    }
  });
  return res.status(200).send(bookings);
});

exports.get_booking = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const booking = prisma.Booking.findMany({
    where: {
      id: id,
    },
    include: {
      property: {
        select: {
          id: true,
          listingName: true,
          title: true,
          subTitle: true,
          logo: true,
          images: true
        },
      },
      branch:{
        select:{
          id:true,
          branchName:true,
          images: true,
          city: true,
          area: true,
          latitude: true,
          longitude: true,
          country: true,
          location: true,
        }
      }
    },
  });
  return res.status(200).send(booking);
});

exports.update_booking = asyncHandler(async (req, res) => {
  try {
    const data = req.body;
    const id = parseInt(req.params.id, 10);
    const prevasset = await prisma.Booking.findFirst({
      where: {
        id: id,
      },
      include: {
        owner: {
          select: { id: true, phoneNumber: true },
        },
      },
    });
    const prepareData = {};
    (prepareData.startDate = data.startDate
      ? new Date(data.startDate)
      : prevasset.startDate),
      (prepareData.endDate = data.endDate
        ? new Date(data.endDate)
        : prevasset.endDate);
    prepareData.slot = data.slot ?? prevasset.slot;
    prepareData.guestNumber = data.guestNumber ?? prevasset.guestNumber;
    prepareData.cancelReason = data.cancelReason ?? prevasset.cancelReason;
    prepareData.status = data.status ?? prevasset.status;
    if (data.tableId) {
      prepareData.tableId = data.tableId;
    }
    const result = await prisma.$transaction(async (prisma) => {
      const booking = await prisma.Booking.update({
        where: {
          id: id,
        },
        data: prepareData,
      });
      if (booking) {
        if (data.slot != prevasset.slot) {
          let phone_number = "88" + req.user.phoneNumber;
          let message = `Your reservation slot is updated from ${prevasset.slot} to ${data.slot}.\nFor support, contact 01923283543`;
          if (process.env.SMS_TO_USER == 'true') {
            await helper.runSMSservice(encodeURI(message), phone_number);
          }
        }
        if (process.env.SMS_TO_OWNER == 'true') {
          await helper.runSMSservice(
            "Ryservation Updated By Customer.",
            "88" + prevasset.owner?.phoneNumber
          );
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

exports.delete_booking = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const booking = await prisma.Booking.update({
    where: {
      id: id,
    },
    data:{
      deletedAt: now()
    }
  });
  return res.status(200).send(booking);
});
