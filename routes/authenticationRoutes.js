const express = require("express");
const router = express.Router();
const database = require("./../database.js");
const pool = database.pool;
const passport = require("passport");
const bcrypt = require("bcrypt");

router.get("/profile", checkAuthenticated, async (req, res) => {
  let loggedIn = false;
  if (req.isAuthenticated()) {
    loggedIn = true;
  }

  let data = await pool.query('select * from "USERS" where "USER_ID" = $1', [
    req.user,
  ]);

  //get last three orders
  const data2 = await pool.query(
    'SELECT "ORDER_ID", "ORDER_DATE", "STATUS" FROM "ORDERS" , "ORDER_STATUS" WHERE "USER_ID" = $1 AND "ORDER_STATUS"."ORDER_STATUS_ID" = "ORDERS"."ORDER_STATUS_ID" ORDER BY "ORDER_DATE" DESC LIMIT 3;',
    [req.user]
  );
  const orders = data2.rows;

  let user = data.rows[0];
  res.render("profile", {
    id: user.F_NAME + " " + user.L_NAME,
    orders: orders,
    loggedIn: loggedIn,
  });
});

router.get("/profile/account-info", checkAuthenticated, async (req, res) => {
  let loggedIn = false;
  if (req.isAuthenticated()) {
    loggedIn = true;
  }
  //get user peersonal data
  let data = await pool.query('select * from "USERS" where "USER_ID" = $1', [
    req.user,
  ]);
  let user = data.rows[0];

  //get user address
  let data2 = await pool.query(
    'SELECT * FROM public."ADDRESSES" WHERE "USER_ID" = $1;',
    [req.user]
  );
  let address = data2.rows[0];

  res.render("account-info", {
    loggedIn: loggedIn,
    user: user,
    address: address,
  });
});

// update user info
router.post("/updateUser", checkAuthenticated, async (req, res) => {
  const data = await pool.query(
    'UPDATE public."USERS" SET "F_NAME"=$1, "L_NAME"=$2, "PHONE_NUMBER"=$3, "EMAIL"=$4 WHERE "USER_ID" = $5;',
    [req.body.fname, req.body.lname, req.body.phone, req.body.email, req.user]
  );

  res.redirect("/profile/account-info");
});

// update user info address
router.post("/updateUserAddress", checkAuthenticated, async (req, res) => {
  const data = await pool.query(
    'UPDATE public."ADDRESSES" SET "CITY"=$1, "BUILDING"=$2, "ROAD"=$3, "BLOCK"=$4, "APARTMENT"=$5 WHERE "USER_ID" = $6;',
    [
      req.body.city,
      req.body.building,
      req.body.road,
      req.body.block,
      req.body.apartment,
      req.user,
    ]
  );

  res.redirect("/profile/account-info");
});

// /profile/my-orders

router.get("/profile/my-orders", checkAuthenticated, async (req, res) => {
  let loggedIn = false;
  if (req.isAuthenticated()) {
    loggedIn = true;
  }

  const data = await pool.query(
    'SELECT "ORDER_ID", "ORDER_DATE", "STATUS" FROM "ORDERS" , "ORDER_STATUS" WHERE "USER_ID" = $1 AND "ORDER_STATUS"."ORDER_STATUS_ID" = "ORDERS"."ORDER_STATUS_ID" ORDER BY "ORDER_DATE" DESC;',
    [req.user]
  );
  const orders = data.rows;

  res.render("my-orders", { loggedIn: loggedIn, orders: orders });
});

//  < ------------------------------------------------------------ >
//  order recipet

router.get("/orderDetails/:id", checkAuthenticated, async (req, res) => {
  let loggedIn = false;
  if (req.isAuthenticated()) {
    loggedIn = true;
  }

  let id = req.params.id;

  //get user order of thier id
  const data = await pool.query(
    'SELECT * FROM "ORDERS" WHERE "USER_ID" = $1 AND "ORDER_ID" = $2',
    [req.user, id]
  );

  let order = data.rows[0];

  //check if the order id provided is there order
  //and if not aredirect them back to my orders page
  if (order == null) {
    res.redirect("/profile/my-orders");
  } else {
    const data2 = await pool.query(
      'SELECT "ORDER_ID", "ITEM_NAME", "QUANTITY", "PRICE" FROM "ORDER_DETAILS", "MENU_ITEMS" WHERE "ORDER_DETAILS"."ITEM_ID" = "MENU_ITEMS"."ITEM_ID" AND "ORDER_ID" = $1',
      [id]
    );

    let orderDetails = data2.rows;

    res.render("orderDetails", {
      loggedIn: loggedIn,
      orderDetails: orderDetails,
    });
  }
});

//  < ------------------------------------------------------------ >

router.get("/order", checkAuthenticated, async (req, res) => {
  let loggedIn = false;
  if (req.isAuthenticated()) {
    loggedIn = true;
  }
  rows = await database.getMenu();
  res.render("order", { loggedIn: loggedIn, rows: rows });
});

router.post("/makeOrder", checkAuthenticated, async (req, res) => {
  order = JSON.parse(req.body.orderDetails);

  try {
    //insert order and return order id
    const data = await pool.query(
      'INSERT INTO public."ORDERS"("USER_ID", "ORDER_STATUS_ID") VALUES ($1, 1) RETURNING *;',
      [req.user]
    );
    const orderID = data.rows[0].ORDER_ID;

    //loop through the order and insert the details
    //into the order_details table
    for (var i = 0; i < order.list.length; i++) {
      const id = order.list[i].id;
      const quantity = order.list[i].quantity;
      await pool.query(
        'INSERT INTO public."ORDER_DETAILS" ("ORDER_ID", "ITEM_ID", "QUANTITY") VALUES ($1, $2, $3);',
        [orderID, id, quantity]
      );
    }
    res.redirect("/profile");
  } catch (e) {
    console.log(e);
    res.redirect("/order");
  }
});

//  < ------------------------------------------------------------ >

router.get("/login", async (req, res) => {
  let loggedIn = false;
  if (req.isAuthenticated()) {
    loggedIn = true;
  }
  res.render("login.ejs", { loggedIn: loggedIn });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

router.get("/register", async (req, res) => {
  let loggedIn = false;
  if (req.isAuthenticated()) {
    loggedIn = true;
  }
  res.render("register.ejs", { loggedIn: loggedIn });
});

router.post("/register", async (req, res) => {
  //check that info is not null or empty else return to register page
  if (
    req.body.fname != null &&
    req.body.lname != null &&
    req.body.phone != null &&
    req.body.email != null &&
    req.body.password != null
  ) {
    if (
      req.body.fname != "" &&
      req.body.lname != "" &&
      req.body.phone != "" &&
      req.body.email != "" &&
      req.body.password != ""
    ) {
      //add user to the database
      try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const data = await pool.query(
          'INSERT INTO public."USERS" ("F_NAME", "L_NAME", "PHONE_NUMBER", "EMAIL", "PASSWORD") VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [
            req.body.fname,
            req.body.lname,
            req.body.phone,
            req.body.email,
            hashedPassword,
          ]
        );
        userID = data.rows[0].USER_ID;
        //add the address
        await pool.query(
          'INSERT INTO public."ADDRESSES"("CITY", "BUILDING", "ROAD", "BLOCK", "APARTMENT", "USER_ID") VALUES ($1, $2, $3, $4, $5, $6);',
          [
            req.body.city,
            req.body.building,
            req.body.road,
            req.body.block,
            req.body.apartment,
            userID,
          ]
        );
        res.redirect("/login");
      } catch (e) {
        console.log(e);
        res.redirect("/register");
      }
    } else {
      res.redirect("/register");
    }
  } else {
    res.redirect("/register");
  }
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

//template route

// router.get("/order", checkAuthenticated, async (req,res) => {
//   let loggedIn = false;
//   if(req.isAuthenticated()){
//     loggedIn = true;
//   }
//
//
//
// })
//orderDetails

module.exports = router;
