const express = require("express");
const routes = express.Router();
const owner_controller = require("../controller/backend/owner");
const auth_controller = require("../controller/backend/auth");
const amenity_controller = require("../controller/backend/amenities");
const cuisine_controller = require("../controller/backend/cuisine");
const property_controller = require("../controller/backend/property");
const branch_controller = require("../controller/backend/branch");
const table_controller = require("../controller/backend/table");
const role_controller = require("../controller/backend/role");
const util_controller = require("../controller/backend/utility");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
// const booking_controller = require("../controller/backend/booking");
// const report_controller = require("../controller/backend/report");
// const dashboard_controller = require("../controller/backend/dashboard");
const adminMiddleware = require("../middleware/adminMiddleware");

routes.post("/login", auth_controller.attempt_to_login);
routes.get("/me",adminMiddleware, auth_controller.auth_me);
routes.get("/permission",adminMiddleware, auth_controller.all_permission);

routes.post("/upload-property", upload.single('file'), util_controller.upload_property);
routes.post("/upload-branch", upload.single('file'), util_controller.upload_branch);

routes
  .route("/employee").all(adminMiddleware)
  .get(owner_controller.emp_list)
  .post(owner_controller.create_emp_own);

routes
  .route("/employee/:id").all(adminMiddleware)
  .get(owner_controller.emp_get)
  .put(owner_controller.emp_update)
  .delete(owner_controller.delete_emp);

routes
  .route("/amenities").all(adminMiddleware)
  .get(amenity_controller.amenity_list)
  .post(amenity_controller.create_amenity);
routes
  .route("/amenities/:id").all(adminMiddleware)
  .get(amenity_controller.get_amenity)
  .put(amenity_controller.update_amenity)
  .delete(amenity_controller.delete_amenity);

routes
  .route("/cuisine").all(adminMiddleware)
  .get(cuisine_controller.cuisine_list)
  .post(cuisine_controller.create_cuisine);
routes
  .route("/cuisine/:id").all(adminMiddleware)
  .get(cuisine_controller.get_cuisine)
  .put(cuisine_controller.update_cuisine)
  .delete(cuisine_controller.delete_cuisine);

routes
  .route("/property").all(adminMiddleware)
  .get(property_controller.property_list)
  .post(property_controller.create_property);
routes
  .route("/property/:id").all(adminMiddleware)
  .get(property_controller.get_property)
  .put(property_controller.property_update)
  .delete(property_controller.delete_property);

routes
  .route("/branch").all(adminMiddleware)
  .get(branch_controller.branch_list)
  .post(branch_controller.create_branch);
routes
  .route("/branch/:id").all(adminMiddleware)
  .get(branch_controller.get_branch)
  .put(branch_controller.branch_update)
  .delete(branch_controller.delete_branch);

routes
  .route("/table").all(adminMiddleware)
  .get(table_controller.table_list)
  .post(table_controller.create_table);

routes
  .route("/table/:id").all(adminMiddleware)
  .get(table_controller.get_table)
  .put(table_controller.table_update)
  .delete(table_controller.delete_table);

routes
  .route("/role-permission").all(adminMiddleware)
  .get(role_controller.role_list)
  .post(role_controller.create_role);

routes
  .route("/role-permission/:id").all(adminMiddleware)
  .get(role_controller.get_role)
  .put(role_controller.update_role)
  .delete(role_controller.delete_role);

routes
  .route("/make-section").all(adminMiddleware)
  .get(util_controller.section_list)
  .post(util_controller.create_section);

//   routes
//     .route("/booking").all(adminMiddleware)
//     .get(booking_controller.get_all_booking)
//     .post(booking_controller.create_booking);

// routes
//     .route("/booking/:id").all(adminMiddleware)
//     .get(booking_controller.get_booking)
//     .put(booking_controller.update_booking)
//     .delete(booking_controller.delete_booking);

// routes.get("/report",adminMiddleware,report_controller.get_report);
// routes.get("/download-excel",adminMiddleware,report_controller.excel_download);

// routes.get("/sales-data",adminMiddleware,dashboard_controller.sales_data);
// routes.get("/status-slot-data",adminMiddleware,dashboard_controller.status_data);
// routes.get("/owner-list",adminMiddleware,dashboard_controller.owner_list);
// routes.get("/state-data",adminMiddleware,dashboard_controller.state_data);

module.exports = routes;
