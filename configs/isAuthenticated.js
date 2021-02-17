module.exports = (req, res) => {
    if(!req.session && !req.session.user){
        res.json({loginStatus: false})
    }
    else {
        res.json({loginStatus: True, user})
    }
}