const express = require("express");
const routes = express.Router();

// const subassetcomp_controller = require("../controller/frontend/subassetcomp");
const cuisine_controller = require("../controller/backend/cuisine");

// routes.get("/sub-asset-component/:id", subassetcomp_controller.get_subassetcomp);
routes.get("/cuisine", cuisine_controller.cuisine_list);
routes.get("/check-cd", async(req,res) => {
      return res.status(200).send("Hello Bello");
});

module.exports = routes;
