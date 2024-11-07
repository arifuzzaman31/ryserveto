const asyncHandler = require("express-async-handler");
const prisma = require("../../db/prisma");

exports.subassetcomp_list = asyncHandler(async (req, res) => {
    const { from, to, populerItem, eventItem, nearBy, type } = await req.query
    let orderBy = {
    };
    let where = {
        type: type,
        status: true,
        deleted:null
    };
    if (eventItem == "yes") {
        where.isEvent = true
    }
    if (populerItem == "yes") {
        orderBy = {
            asset: {
                bookingCount: 'desc'
            }
        };
    }
    if (nearBy) {
        where.asset = {
            area: nearBy
        }
    }
    const subassetComp = await prisma.SubAssetComponent.findMany({
        skip: Number(from) ? Number(from) - 1 : 0,
        take: Number(to) ? Number(to) : 5,
        where,
        orderBy: orderBy,
        include: {
            asset: {
                select: { id: true, propertyName: true, city: true, area: true, geoTag: true, country: true, bookingCount: true }
            }
        },
    });
    return res.status(200).send(subassetComp);
});

exports.get_subassetcomp = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const subassetcomp = await prisma.SubAssetComponent.findFirst({
        where: {
            id: id,
        },
        include: {
            prices: { select: { id: true, pricing: true } },
            asset: {
                include: {
                    business: {
                        select: { id: true, businessName: true, managerName: true, managerPhone: true, managerEmail: true, managerAddress: true }
                    },
                }
            },
            owner: {
                select: { id: true, name: true, phoneNumber: true }
            },
            subAsset: {
                select: { id: true, amenities: true, address: true }
            },
            tables: { select: { id: true, type: true, capacity: true, position: true, size: true } }
        }
    });
    return res.status(200).send(subassetcomp);
});