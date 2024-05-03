require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const Login = require("./routes/login");
var session = require("express-session");

const app = express();
const port = process  .PORT || 5000;

app.use(
  session({
    secret: "qwertyuhjjdfghjkl",
    resave: false,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use(bodyParser.json());

app.use("/login", Login);

app.use((err, req, res, next) => {
  console.log(err);
  next();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
