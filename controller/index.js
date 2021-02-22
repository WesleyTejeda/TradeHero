const db = require("../models");
const bcrypt = require("bcryptjs");
const authCheck = require("../configs/isAuthenticated.js");
const axios = require("axios");
require("dotenv").config();

module.exports = {
    //Get functions
    //Get user portfolio w/ stocks populated
    getUserProfile: (req, res) => {
        console.log(req.query);
        let userData = {
            currency: 0,
            portfolio: {}
        }
        db.User.findOne({ username: req.query.username })
            .then(({ currency }) => userData.currency = currency)
            .catch(err => res.json(err))
        db.Portfolio.findOne({ username: req.query.username }).populate("stocks")
            .then(user => {
                console.log(user);
                userData.portfolio = user;
                res.json(userData);
            })
            .catch(err => res.json(err));
    },
    //Search stock
    getStockInfo: (req, res) => {
        //Take in symbol variable inside req.query object
        console.log(req.query);
        axios.get(`https://finnhub.io/api/v1/quote?symbol=${req.query.symbol}&token=${process.env.apiKey}`)
            .then(({ data }) => {
                console.log(data);
                res.json(data);
            })
            .catch(err => res.json(err))
    },
    getCompanyInfo: (req, res) => {
        //Take in company symbol variable inside req.query object
        console.log(req.query);
        axios.get(`https://finnhub.io/api/v1//stock/profile2?symbol=${req.query.symbol}&token=${process.env.apiKey}`)
            .then(({ data }) => {
                console.log(data);
                res.json(data);
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
    logOutUser: (req, res) => {
        res.cookie("session", process.env.cookieSecret, { expires: new Date(0) });
        res.status(200).json({ message: "User logged out" });
    },
    createUser: (req, res) => {
        //Takes in req.body object {username, password, firstName, lastName}
        //Creates user account and initialized portfolio on account creation (accounts only have 1 portfolio)
        console.log(req.body);
        db.User.find({ username: req.body.username })
            .then(user => {
                if(user.length == 0) {
                    let hash = bcrypt.hashSync(req.body.password);
                    req.body.password = hash;
                    db.User.create(req.body)
                        .then(account => {
                            req.session.username = account.username;
                            console.log(req.session);
                            db.Portfolio.create({ username: req.body.username})
                                .then(results => console.log("Portfolio initialized"))
                                .catch(err => res.json(err))
                            res.status(200).json({msg: "Signed up and logged in."})
                        })
                        .catch(err => res.json(err))
                }
                else {
                    res.status(500).json({msg: "User already exists with this username, please sign up with a different username."})
                }
            })
    },
    loginStatus: (req, res) => {
        authCheck(req, res);
    },
    //Put functions
    updatePassword: (req, res) => {
        //Takes in body object {username, password, newPassword}
        console.log(req.body);
        let hash = bcrypt.hashSync(req.body.newPassword);
        db.User.findOneAndUpdate({ username: req.body.username , password: bcrypt.hashSync(req.body.password)}, { $set: {password: hash }})
            .then(results => res.json({ msg: "Password updated" }))
            .catch(err => res.json(err))
    },
    buyStock: async (req, res) =>{
        //Takes in body object {username, name, quantity}
        console.log(req.body);
        const getBuyRate = () => {
            console.log("Awaiting price ========");
            return new Promise(resolve => {
                axios.get(`https://finnhub.io/api/v1/quote?symbol=${req.body.name}&token=${process.env.apiKey}`)
                    .then(({ data }) => resolve(data.c))
                    .catch(err => res.json(err))
                    })
        }
        let buyRate = await getBuyRate();
        let buyRequest = {name: req.body.name, priceBought: parseInt(buyRate), quantity: parseInt(req.body.quantity), dateBought: Date.now()};
        //Checks if user can buy the stocks based on quantity and price.
        db.User.findOne({ username: req.body.username })
            .then(({ currency }) => {
                //If purchase is greater than user's balance, cancel the request
                console.log(currency);
                if(parseInt(currency) < (buyRequest.quantity * buyRequest.priceBought)) {
                    res.json({msg: "You do not have sufficient funds for this purchase. Please check your balance."})
                }
                else { 
                    let newBalance = parseInt(currency) - (buyRequest.quantity * buyRequest.priceBought);
                    db.User.findOneAndUpdate({ username: req.body.username }, { $set: { currency: newBalance }})
                        .then(results => console.log(results))
                        .catch(err => console.log(err))
                }
            })
            .catch(err => res.json(err))
            //Creates stock purchase and then inserts bought stocks onto user's portfolio. Then updates user's account balance
            db.Stock.create(buyRequest)
                .then(({ _id }) => {
                    //Update totalInvested for portfolio
                    db.Portfolio.findOneAndUpdate({ username: req.body.username }, { $inc: { totalInvested: buyRequest.priceBought*buyRequest.quantity}})
                        .then(results => console.log(results))
                        .catch(err => console.log(err))
                    //Add new stock purchase to portfolio
                    db.Portfolio.findOneAndUpdate({ username: req.body.username }, { $push: { stocks: _id }}, { new: true })
                        .then(results => res.json({ msg: `Successfully bought ${buyRequest.quantity} shares of ${buyRequest.name}`}))
                        .catch(err => res.json(err))
                })
                .catch(err => res.json(err))
    },
    //Delete functions
    sellStock: (req, res) => {
        //Takes in body object {username, name, quantity}
        console.log(req.body)
        db.Portfolio.find({ username: req.body.username }).populate("stocks")
            .then(async results => {
                console.log(results);
                let stocks = results[0].stocks;
                let sellResult = {
                    revenue: 0,
                    quantity: 0
                }
                const getSellRate = () => {
                    console.log("Awaiting price ========");
                    return new Promise(resolve => {
                        axios.get(`https://finnhub.io/api/v1/quote?symbol=${req.body.name}&token=${process.env.apiKey}`)
                            .then(({ data }) => resolve(data.c))
                            .catch(err => res.json(err))
                            })
                }
                let sellRate = await getSellRate();
                console.log(sellRate, "==============");
                stocks.forEach( stock => {
                    //Finding matches
                    if(stock.name == req.body.name ){
                        if(parseInt(req.body.quantity) >= stock.quantity){
                            sellResult.revenue += stock.quantity * sellRate;
                            sellResult.quantity += stock.quantity;
                            db.Portfolio.findOneAndUpdate({ username: req.body.username}, { $pull: {stocks: stock._id}})
                            .then(results => console.log(results))
                            .catch(err => console.log(err))
                        }
                        else {
                            sellResult.revenue += sellRate * parseInt(req.body.quantity);
                            sellResult.quantity = parseInt(req.body.quantity);
                            db.Stock.findOneAndUpdate({ _id: stock._id }, { $set: {quantity: stock.quantity - req.body.quantity} })
                                .then(results => console.log(results))
                                .catch(err => console.log(err))
                        }
                        //Update transaction array in portfolio
                        db.Portfolio.findOneAndUpdate({ username: req.body.username}, { $push: { transactions: { quantity: sellResult.quantity, revenue: sellResult.revenue, name: req.body.name, date: JSON.stringify(Date.now()) }}})
                            .then(results => console.log(results))
                            .catch(err => console.log(err))
                        //Update user currency
                        db.User.findOneAndUpdate({ username: req.body.username }, { $inc: { currency: sellResult.revenue }})
                            .then(results => console.log(results))
                            .catch(err => console.log(err))
                    }
                })
                res.status(200).json({msg: `Successfully sold ${sellResult.quantity} shares of ${req.body.name} stock.`, result: sellResult})
            })
            .catch(err => res.json(err))
    }
}