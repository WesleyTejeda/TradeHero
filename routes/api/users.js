const router = require("express").Router();
const controller = require("../../controller");

//Matches with /api/users
router.route("/")
    //Get user profile with portfolio w/ stocks populated
    //Takes in query object {username}
    .get(controller.getUserProfile)
    

//Matches with /api/users/login
router.route("/login")
    //Checks if the user is logged in
    .get(controller.loginStatus)
    //Takes in body object {username, password}
    .post(controller.loginUser)

//Matches with /api/users/logout/
router.route("/logout")
    //Logs out user
    .post(controller.logOutUser)

//Matches with /api/users/signup/
router.route("/signup")
    //Takes in req.body object {username, password, firstName, lastName}
    .post(controller.createUser)

//Matches with /api/users/account/
router.route("/account")
    //Takes in body object {username, password, newPassword}
    .put(controller.updatePassword)

module.exports = router;