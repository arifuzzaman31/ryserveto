const express = require("express");
const routes = express.Router();
const userauth_controller = require("../controller/frontend/auth");
const booking_controller = require("../controller/frontend/booking");
const wishlist_controller = require("../controller/frontend/wishList");
const adminMiddleware = require("../middleware/adminMiddleware");

routes.post("/auth/login", userauth_controller.otp_login);
routes.put("/auth/logout",adminMiddleware,userauth_controller.user_logout);
routes.get("/me",adminMiddleware, userauth_controller.auth_me);
routes.put("/user/:id",userauth_controller.update_me);
routes.delete("/user",userauth_controller.delete_account);
routes.get("/terms-condition", userauth_controller.terms_condition);
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