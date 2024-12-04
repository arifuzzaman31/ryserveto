const express = require("express");
const routes = express.Router();

const home_controller = require("../controller/frontend/home");
const property_controller = require("../controller/frontend/property");
const cuisine_controller = require("../controller/backend/cuisine");

routes.get("/property", property_controller.property_list);
routes.get("/property/:id", property_controller.get_property);
routes.get("/property-food/:id", property_controller.property_food);
routes.get("/branch-list/:area?", property_controller.branch_list_property);//get branch list
routes.get("/branch-property/:id", property_controller.branch_property);//get property under branch
routes.get("/cuisine", cuisine_controller.cuisine_list);
routes.get("/home-page", home_controller.home_list);
routes.get("/:group/search", property_controller.search_list);

routes.get("/check-cd", async(req,res) => {
      return res.status(200).send("Hello Bello");
});

module.exports = routes;
