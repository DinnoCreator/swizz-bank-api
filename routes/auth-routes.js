require("dotenv").config();
//packages and utilities
const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
const accNo = require("../utilities/acc");
const capNsmalz = require("../utilities/capNsmalz");

//router
const { Router } = require("express");

//Adds the first 3 numbers needed in creating the account number
const accTypeSavings = "302";
const accTypeCheckings = "403";

//register to create an account
router.post("/create", async (req, res) => {
  try {
    // details received from client side
    const email = req.body.email;
    const fName = capNsmalz.neat(req.body.fName);
    const mName = capNsmalz.neat(req.body.mName);
    const lName = capNsmalz.neat(req.body.lName);
    const dOB = req.body.dOB;
    const address = capNsmalz.neat(req.body.address);
    const phoneNo = req.body.phoneNo;
    const accountType = req.body.accountType;
    const accountType1 = req.body.accountType1;
    const gender = capNsmalz.neat(req.body.gender);
    const accBal = req.body.accBal;
    const accBal1 = req.body.accBal1;

    
    // Checks Customer records for existing customers
    const customers = await pool.query(
      "SELECT * FROM customers WHERE customer_email = $1",
      [email]
    );
    if (customers.rows.length !== 0)
      return res.status(403).json({ error: "Customer already exists!" });
    // Hashes 4Digitpin
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

     //saves new customer
     const newCustomer = await pool.query(
      "INSERT INTO customers(first_name,middle_name,last_name,customer_email,customer_gender,customer_address,customer_phoneno,customer_dob,customer_password,customer_payment,c_date,c_time) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *",
      [
        fName,
        mName,
        lName,
        email,
        gender,
        address,
        phoneNo,
        dOB,
        hashedPassword,
        "Paid",
        dayjs().format("YYYY-MM-DD"),
        dayjs().format("HH:mm:ss")
      ]
    );

    //gets new customer uuid and other details
    const customerID = newCustomer.rows[0].customer_id;

    if (accountType1.length < 6) {
      // Generates first 3 digits of the account number based on accType selected from client side
    let typeAcc = await function () {
      let usn = "";
      if (accountType === "Savings") {
        return (usn = accTypeSavings);
      } else if (accountType === "Checkings") {
        return (usn = accTypeCheckings);
      }
    };
    // Generates first 3 digits of the account number based on accType selected from client side
    let typeAcc1 = await function () {
      let usn = "";
      if (accountType1 === "Savings") {
        return (usn = accTypeSavings);
      } else if (accountType1 === "Checkings") {
        return (usn = accTypeCheckings);
      }
    };
      // uses new customer uuid to create bank account
    await pool.query(
      "INSERT INTO accounts(account_no,customer_id,account_bal,account_type,account_status,account_name,c_date,c_time) VALUEs ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [
        `${typeAcc()}${accNo.index()}`,
        customerID,
        Number(accBal),
        accountType,
        "Opened",
        `${fName} ${lName}`,
        dayjs().format("YYYY-MM-DD"),
        dayjs().format("HH:mm:ss")
      ]
    );
    await pool.query(
      "INSERT INTO accounts(account_no,customer_id,account_bal,account_type,account_status,account_name,c_date,c_time) VALUEs ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [
        `${typeAcc1()}${accNo.index()}`,
        customerID,
        Number(accBal1),
        accountType1,
        "Opened",
        `${fName} ${lName}`,
        dayjs().format("YYYY-MM-DD"),
        dayjs().format("HH:mm:ss")
      ]
    );
    return res.status(200).json({
      Registration: "Successful!",
      email: newCustomer.rows[0].customer_email,
    });
    } else {
      // Generates first 3 digits of the account number based on accType selected from client side
      let typeAcc = await function () {
        let usn = "";
        if (accountType1 === "Savings") {
          return (usn = accTypeSavings);
        } else if (accountType1 === "Checkings") {
          return (usn = accTypeCheckings);
        }
      };
      
      // uses new customer uuid to create bank account
    await pool.query(
      "INSERT INTO accounts(account_no,customer_id,account_bal,account_type,account_status,account_name,c_date,c_time) VALUEs ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [
        `${typeAcc()}${accNo.index()}`,
        customerID,
        Number(accBal),
        accountType,
        "Opened",
        `${fName} ${lName}`,
        dayjs().format("YYYY-MM-DD"),
        dayjs().format("HH:mm:ss")
      ]
    );

    return res.status(200).json({
      Registration: "Successful!",
      email: newCustomer.rows[0].customer_email,
    });
    }
    

    
  } catch (error) {
    console.log(error);
  }
});

//login begin
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    //Email Check
    const users = await pool.query(
      "SELECT * FROM customers WHERE customer_email = $1",
      [email]
    );
    if (users.rows.length === 0)
      return res.status(401).json({ error: "Email is incorrect!" });

    //Password Check
    const validPassword = await bcrypt.compare(
      password,
      users.rows[0].customer_password
    );
    if (!validPassword)
      return res.status(401).json({ error: "Incorrect password!" });

    //JWT
    const user_email = users.rows[0].user_email;
    const user_name = `${users.rows[0].first_name} ${users.rows[0].last_name}`;
    const user_id = users.rows[0].customer_id;
    const token = await jwt.sign({ user_id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "25m",
    });
    return res.status(200).json({
      auth: true,
      token: token,
      person: { name: user_name, email: user_email, id: user_id },
    });
  } catch (error) {
    return res.status(411).json({ error: error.message });
  }
});



//Exports auth-routes.js
module.exports = router;