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
        {
            quantity: {
                type: Number
            },
            revenue: {
                type: Number
            },
            name: {
                type: String
            }
        }
    ]
})

const Portfolio = mongoose.model("Portfolio", portfolioSchema);
module.exports = Portfolio;