const CASAuthentication = require("node-cas-authentication");
const router = require("express").Router();

const jwt = require("jsonwebtoken");


var cas = new CASAuthentication({
  cas_url: process.env.CAS_SERVER_URL,
  service_url: process.env.SERVICE_URL,
  cas_version: "3.0",
  renew: false,
  is_dev_mode: false,
  dev_mode_user: "",
  dev_mode_info: {},
  session_name: "cas_user",
  session_info: "cas_userinfo",
  destroy_session: false,
  return_to: process.env.REDIRECT_URL,
});

router.get("/", cas.bounce, async (req, res) => {
  const ticket = req.query.ticket;
  console.log("USER NAME: ", req.session.cas_user);
  console.log("ROLL NUMBER: ", req.session.cas_userinfo.rollno);
  console.log("FIRST NAME: ", req.session.cas_userinfo.firstname);
  console.log("LAST NAME: ", req.session.cas_userinfo.lastname);
  res.redirect(process.env.REDIRECT_URL + `?name=${req.session.cas_userinfo.firstname}&email=${req.session.cas_user}`);


  if (ticket) {
    res.redirect(process.env.REDIRECT_URL + `?name=${req.session.cas_userinfo.firstname}&email=${req.session.cas_user}`);
    console.log("TICKET: ", ticket);
    cas.validate(ticket, function (err, status, username, extended) {
      if (err) {
        res.status(500);
        res.send(err);
        return;
      }

      if (status) {
        res.send(
          "Success! Loggeeed in as " +
            username +
            " with extended attributes: " +
            JSON.stringify(extended)
        );
        console.log("STATUS", status);
        res.redirect(process.env.REDIRECT_URL + `?name=${req.session.cas_userinfo.firstname}&email=${req.session.cas_user}`);
      }
    });
  }

  const user = req.session[cas.session_info || {}];
  const email = user["e-mail"];
  const name = user["name"];

  const payload = {
    email: email,
    name: name,
  };

  const token = jwt.sign(payload, process.env.SECRET_KEY);

  res.cookie("token", token, { httpOnly: true });
  res.cookie("name", name, { httpOnly: false });
  res.cookie("email", email, { httpOnly: false });
  res.redirect(process.env.REDIRECT_URL + `?name=${name}&email=${email}`);
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("name");
  res.clearCookie("email");
  res.redirect(process.env.CAS_SERVER_URL + "/logout");
});

router.get("/validate", (req, res) => {
  console.log("ANY");
  const token = req.cookies.token;
  const name = req.cookies.name;
  const email = req.cookies.email;

  if (!token || !name || !email) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  res.json({
    token: token,
    name: name,
    email: email,
  });
  res.redirect(process.env.REDIRECT_URL + `?name=${name}&email=${email}`);
});

module.exports = router;
