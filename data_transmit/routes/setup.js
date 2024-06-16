const express = require("express");
const router = express.Router();
// const { userLogin } = require('../middleware/validator')
 const { protect } = require('../middleware/auth')
const { CreateChannel, ViewFundManager, UpdateFundManager, PingChannel } = require("../controllers/api/manage");
const { CreateTransaction } = require("../controllers/transaction/manage");


//routes

///channel
router.route("/system/create_channel").post(CreateChannel);
router.route("/system/view_channels").post(ViewFundManager);
router.route("/system/update_channel").post(UpdateFundManager);
router.route("/ping_channel").post(protect,PingChannel);


///channel
router.route("/new_transaction").post(CreateTransaction);
//user login auth
// router.route("/auth").post(protectUser, VerifyUser);
// router.route("/counter_auth").post(protectCounter, VerifyCounter);
// router.route("/user_login").post(UserAuth);
// router.route("/logout").post(protect, Logout);
module.exports = router;
