const express = require("express");
const router = express.Router();
// const { userLogin } = require('../middleware/validator')
// const { protect } = require('../middleware/auth')
const { CreateChannel, ViewFundManager, UpdateFundManager } = require("../controllers/api/manage");


//routes

///roles
router.route("/system/create_channel").post(CreateChannel);
router.route("/system/view_channels").post(ViewFundManager);
router.route("/system/update_channel").post(UpdateFundManager);

//user login auth
// router.route("/auth").post(protectUser, VerifyUser);
// router.route("/counter_auth").post(protectCounter, VerifyCounter);
// router.route("/user_login").post(UserAuth);
// router.route("/logout").post(protect, Logout);
module.exports = router;
