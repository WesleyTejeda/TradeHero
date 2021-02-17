const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const portfolioSchema = new Schema ({
    username: {
        type: String,
        required: true,
        unique: true
    },
    stocks: [
        {
            type: Schema.Types.ObjectId,
            ref: "Stock"
        }
    ]
})

const Portfolio = mongoose.model("Portfolio", portfolioSchema);
module.exports = Portfolio;