const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stockSchema = new Schema ({
    name: {
        type: String,
        required: true
    },
    priceBought: {
        type: Number,
        required: true
    },
    dateBought: {
        type: String
    },
    quantity: {
        type: Number,
        required: true
    }
})

const Stock = mongoose.model("Stock", stockSchema);
module.exports = Stock;