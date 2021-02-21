const router = require("express").router();
const controller = require("../../controller");

//Matches /api/stocks/
router.use("/")
    .get(controller.getStockInfo)
    //Takes in body object {username, name, priceBought, quantity, dateBought}
    .put(controller.buyStock)
    //Takes in body object {username, name, quantity}
    .delete(controller.sellStock)
    
//Matches /api/stocks/company
router.user("/company")
    //Takes in req.query object {company}
    .get(controller.getCompanyInfo)

module.exports = router;