const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stockSchema = new Schema ({
    name: {
        type: String,
        required: true
    },
    priceBought: {
        type: Number
    },
    dateBought: {
        type: String
    },
    percentChange: {
        type: Number
    },
    asOfDate: {
        type: String
    }
})

const Stock = mongoose.model("Stock", stockSchema);
module.exports = Stock;