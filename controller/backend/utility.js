const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");
const ExcelJS = require('exceljs');
const { slugify } = require("../../helper/helper");

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

exports.section_list = asyncHandler(async(req,res) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const sect = await prisma.section.create({
        data: {
          title: data.title,
          subtitle: data.subtitle,
          slug: slugify(data.title ?? data.pattern),
          pattern: data.pattern,
          contains: data.contains,
          signature: data.signature ?? 0,
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
