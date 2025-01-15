const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");
const ExcelJS = require('exceljs');
const { slugify } = require("../../helper/helper");
const { sendEmail } = require("../../services/emailService");

exports.upload_property = asyncHandler(async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const csvStream = await workbook.csv.readFile(req.file.path);
          let rowData = []
        csvStream.eachRow((row, rowNumber) => {   
                if(rowNumber !=1) rowData.push(row.values)
        });
        // const modify = rowData.map(v => {
        //   return v.filter((t,i) => i != 0);
        // });
        res.status(200).send(rowData);

    } catch (error) {
        console.error('Error reading CSV file:', error);
        res.status(500).send('Error processing the file.');
    }
    return false;
  });

exports.upload_branch = asyncHandler(async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const csvStream = await workbook.csv.readFile(req.file.path);
          let dataset = []
          // delete csvStream[0]
        csvStream.eachRow((row, rowNumber) => {   
                dataset.push(row.values)
                delete dataset[0]
          //   console.log(`Row ${rowNumber}:`, row.values);
        });
    //     console.log(dataset)
        res.send(dataset);
    } catch (error) {
        console.error('Error reading CSV file:', error);
        res.status(500).send('Error processing the file.');
    }
    return false;
});

exports.create_section = asyncHandler(async(req,res) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const data = await req.body
      const sect = await prisma.section.create({
        data: {
          title: data.title,
          subtitle: data.subtitle,
          slug: slugify(data.title ?? data.pattern),
          type: data.type,
          group: data.group,
          pattern: data.pattern,
          signature: data.signature ?? 0,
          content: data.content,
          optionalData: data.optionalData,
          status: data.status == "true" ? true : false,
        },
      });
      return sect;
    });
    return res.status(201).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
})

exports.section_update = asyncHandler(async(req,res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await prisma.$transaction(async (prisma) => {
      const data = await req.body
      const sect = await prisma.section.update({
        where: {
          id: id,
        },
        data: {
          title: data.title,
          subtitle: data.subtitle,
          slug: slugify(data.title ?? data.pattern),
          type: data.type,
          group: data.group,
          pattern: data.pattern,
          signature: data.signature,
          content: data.content,
          optionalData: data.optionalData,
          status: data.status == "true" ? true : false,
        },
      });
      return sect;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
})

exports.section_list = asyncHandler(async(req,res) => {
  try {
    const { perPage,pageNo,group } = req.query
    let orderBy = {
        precedency: "asc"
    };
    let where = {
        group: group
    };
    const perPg = perPage ? Number(perPage) : 10;
    const from = Number(pageNo * perPg) - Number(perPg);
    const resp = await prisma.section.findMany({
        skip: pageNo ? from : 0,
        take: perPg,
        where,
        orderBy: orderBy 
    });
    return res.status(200).send(resp);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
})

exports.section_destroy = asyncHandler(async(req,res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await prisma.$transaction(async (prisma) => {
      const sect = await prisma.section.update({
        where: {
          id: id,
        },
        data: {
          deletedAt: new Date(),
          updatedBy: req.user?.id
        },
      });
      return sect;
    });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  } finally {
    await prisma.$disconnect();
  }
})

exports.sendtestmail = asyncHandler(async(req,res) => {
  const details = {
    email: 'arif.zaman@webable.digital',
    subject: 'Welcome! You will be vanished',
    username: 'Modusudon',
    date: new Date(),
    address: "Level 9, Road 4, Gulshan 1, Dhaka"
  };
  const data = await sendEmail(details);
  return res.status(200).send(data);
});
