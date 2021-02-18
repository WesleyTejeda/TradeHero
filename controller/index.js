const db = require("../models");
const bcrypt = require("bcryptjs");
const authCheck = require("../configs/isAuthenticated.js");
const mongoos = require("mongoose");
const axios = require("axios");
require("dotenv").config();

module.exports = {
    //Get functions
    //Get user profile with portfolio w/ stocks populated
    getUserProfile: (req, res) => {
        console.log(req.body);
        db.User.findOne({ username: req.body.username }).populate({
            path: "portfolios", populate: {
                path: "stocks",
                model: "Stock"
            }
        })
            .then(user => {
                console.log(user);
                res.json(user);
            })
            .catch(err => res.json(err));
    },
    //Search stock
    getStockInfo: (req, res) => {
        //Take in symbol variable inside req.body object
        console.log(req.body);
        axios.get(`https://finnhub.io/api/v1/quote?symbol=${req.body.symbol}&token=${process.env.apiKey}`)
            .then(results => {
                res.json(results);
            })
            .catch(err => res.json(err))
    },
    getCompanyInfo: (req, res) => {
        //Take in company variable inside req.body object
        console.log(req.body);
        axios.get(`https://finnhub.io/api/v1//stock/profile2?${req.body.company}&token=${process.send.apiKey}`)
            .then(results => {
                res.json(results);
            })
            .catch(err => res.json(err))
    },
    //Post functions
    //Login
    loginUser: (req, res) => {
        console.log(req.body);
        db.User.findOne({ username: req.body.username })
            .then(user => {
                console.log(user);
                if(!user) {
                    res.status(500).json({err:"Could not find an account with username provided. Please enter the correct credentials."})
                }
                else {
                    if(!bcrypt.compareSync(req.body.password, user.password)){
                        res.status(500).json({err: "Could not find an account with provided username and password. Please enter the correct credentials."})
                    }
                    console.log("Logging in user");
                    req.session.username = user.username;
                    console.log(req.session);
                    res.status(200).json({msg: "Login successful."})
                }
            })
            .catch(err => res.json(err));
    },
    loginStatus: (req, res) => {
        authcheck(req, res);
    },
    //Put functions

    //Delete functions
}