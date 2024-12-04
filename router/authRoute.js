const express = require("express");
const routes = express.Router();
const userauth_controller = require("../controller/frontend/auth");
const booking_controller = require("../controller/frontend/booking");
const wishlist_controller = require("../controller/frontend/wishList");
const util_controller = require("../controller/backend/utility")
const adminMiddleware = require("../middleware/adminMiddleware");

routes.post("/auth/otp/request", userauth_controller.otp_request);
routes.post("/auth/otp/verify", userauth_controller.otp_verify);
routes.post("/auth/information", userauth_controller.update_information);
routes.post("/auth/guest/login", userauth_controller.guest_login);
routes.put("/auth/logout",adminMiddleware,userauth_controller.user_logout);
routes.get("/me",adminMiddleware, userauth_controller.auth_me);
routes.put("/user/:id",userauth_controller.update_me);
routes.delete("/user",userauth_controller.delete_account);
routes.get("/terms-condition", userauth_controller.terms_condition);

routes.post("/test-mail", util_controller.sendtestmail);

routes
    .route("/booking")
    .all(adminMiddleware)
    .get(booking_controller.booking_list)
    .post(booking_controller.create_booking);

routes
    .route("/booking/:id")
    .all(adminMiddleware)
    .get(booking_controller.get_booking)
    .put(booking_controller.update_booking)
    .delete(booking_controller.delete_booking);
    
routes.route("/wishlist")
    .all(adminMiddleware)
    .post(wishlist_controller.add_to_wishList)
    .get(wishlist_controller.get_all_wishList)

    routes.route("/wishlist/:id")
    .all(adminMiddleware)
    .delete(wishlist_controller.destroy_wishList);

module.exports = routes;