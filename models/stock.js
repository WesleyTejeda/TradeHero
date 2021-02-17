const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stockSchema = new Schema ({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number
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