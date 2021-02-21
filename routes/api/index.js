const router = require("express").Router();
const userRoutes = require("./users");
const stockRoutes = require("./stocks");

//Package routes here
//User Routes
router.use("/users", userRoutes);

//Stock Routes
router.use("/stocks", stockRoutes);

module.exports = router;