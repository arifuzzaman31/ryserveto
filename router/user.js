const express = require("express");
const routes = express.Router();

const home_controller = require("../controller/frontend/home");
const property_controller = require("../controller/frontend/property");
const event_controller = require("../controller/frontend/event");

routes.get("/property", property_controller.property_list);
routes.get("/property/:id", property_controller.get_property);
routes.get("/property-food/:id", property_controller.property_food);
routes.get("/event", event_controller.event_list);
routes.get("/event/:id", event_controller.get_event);
routes.get("/branch-list/:area?", property_controller.branch_list_property);//get branch list
routes.get("/branch-property/:id", property_controller.branch_property);//get property under branch
routes.get("/cuisine", home_controller.cuisine_list);
routes.get("/home-page", home_controller.home_list);
routes.get("/:group/search", property_controller.search_list);
routes.get("/food-category/:id", home_controller.foodCategory_list);

routes.get("/check-cd", async(req,res) => {
      return res.status(200).send("Hello Bello");
});

module.exports = routes;
