const asyncHandler = require("express-async-handler");
const prisma = require("../../lib/db/prisma");
const ExcelJS = require('exceljs');

exports.upload_property = asyncHandler(async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const csvStream = await workbook.csv.readFile(req.file.path);
          let dataset = []
          let rowData = []
          // delete csvStream[0]
        csvStream.eachRow((row, rowNumber) => {   
                console.log(`Row ${rowNumber}:`);
                if(rowNumber !=1) rowData.push(row.values)
        });
        let cleanedData = rowData.map(subArray => {
            let index = subArray.indexOf(null);
            if (index !== -1) {
                subArray.splice(index, 1); // Remove the first occurrence of null
            }
            return subArray;
        });
        res.send(cleanedData);
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
