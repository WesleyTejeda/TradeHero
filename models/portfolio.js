const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const portfolioSchema = new Schema ({
    username: {
        type: String,
        required: true,
        unique: true
    },
    totalInvested: {
        type: Number,
        default: 0
    },
    stocks: [
        {
            type: Schema.Types.ObjectId,
            ref: "Stock"
        }
    ],
    transactions: [
    ]
})

const Portfolio = mongoose.model("Portfolio", portfolioSchema);
module.exports = Portfolio;