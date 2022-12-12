require("dotenv").config();
const router = require("express").Router();
const pool = require("../db");
const authenticateToken = require("../utilities/authenticateToken");

//router
const { Router } = require("express");

// const email = "drprosperdylan@gmail.com";
// const fName = capNsmalz.neat("prosper");
// const mName = capNsmalz.neat("prosper");
// const lName = capNsmalz.neat("dylan");
// const dOB = "1986-3-12";
// const address = capNsmalz.neat("carlifonia");
// const phoneNo = "08133060502";
// const accountType = "Checkings";
// const gender = capNsmalz.neat("male");
// const accBal = 358944660;
// get User
router.get("/user", authenticateToken, async (req, res) => {
    try {
      const userId = req.user;
      const userAccounts = await pool.query(
        "SELECT * FROM accounts WHERE customer_id = $1 ORDER BY c_date ASC, c_time ASC",
        [userId]
      );
  
      res.json({ accounts: userAccounts.rows });
    } catch (error) {
      console.log(error.message);
    }
  });

//Exports users-routes.js
module.exports = router;
