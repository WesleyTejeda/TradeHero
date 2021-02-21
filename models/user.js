const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.SchemaType({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    currency: {
        type: Number,
        default: 5000
    }
})
const User = mongoose.model("User", userSchema);
module.exports = User;