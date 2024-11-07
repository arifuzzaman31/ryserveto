const express = require("express");
const routes = express.Router();
const multer = require('multer');
const ExcelJS = require('exceljs');
// const subassetcomp_controller = require("../controller/frontend/subassetcomp");
const cuisine_controller = require("../controller/backend/cuisine");
const upload = multer({ dest: 'uploads/' });

routes.post('/upload-csv', upload.single('file'), async (req, res) => {
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
// routes.get("/sub-asset-component/:id", subassetcomp_controller.get_subassetcomp);
routes.get("/cuisine", cuisine_controller.cuisine_list);
routes.get("/check-cd", async(req,res) => {
      return res.status(200).send("Hello Bello");
});

module.exports = routes;
