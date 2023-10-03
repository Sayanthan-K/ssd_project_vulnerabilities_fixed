const jwt = require("jsonwebtoken");
const mongodb = require("mongodb");
const db = require("../db");
const cookie = require("cookie");

module.exports = async (req, res, next) => {
     //  solution for unvalidated redirects 
  // 1. Validate and sanitize user input for the destination URL
  const userDestination = req.url;
  // Define a whitelist of allowed redirect destinations
  const allowedDestinations = ['/user/login', '/announcement/get_announcements'];
  if (!allowedDestinations.includes(userDestination)) {
    console.log("Invalid or unauthorized destination.");
    return res.status(400).json({ error: "Invalid or unauthorized destination." });
  }
  const cookies = cookie.parse(req.headers.cookie || "");

  if (!cookies?.jwtAcc)
    return res.status(401).json({ message: "unauthorized jwtAcc" });
  if (!cookies?.jwt)
    return res.status(401).json({ message: "unauthorized jwt" });

  const accessToken = cookies.jwtAcc;

  let UID;

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    UID = decoded.userID;
  } catch (err) {
    console.log(err.message);

    if (err.message === "jwt expired") {
      console.log(
        "AcessToken has been expired. it is getting refresh. please wait!"
      );
      if (!cookies?.jwt)
        return res.status(401).json({ message: "unauthorized 1" });

      const refreshToken = cookies.jwt;

      try {
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        const resp = await db.getDb().db().collection("User").findOne({
          email: decodedRefresh.email,
          password: decodedRefresh.password,
        });

        if (resp) {
          UID = resp._id;
          const newAccessToken = jwt.sign(
            { userID: resp._id, email: resp.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "45m" }
          );
          res.cookie("jwtAcc", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 1000,
          });
        } else {
          return res.status(200).json({ auth: false });
        }
      } catch (error) {
        if (err.message === "jwt expired") {
          console.log("RefreshToken has been expired! please login again.");
          return res.status(403).json({
            auth: false,
            message: "Your session has been expired! please login again.",
          });
        } else {
          return res.status(403).json({ message: "expired" });
        }
      }
    } else {
      req.auth = false;
      return next();
    }
  }
  console.log("Authonticated");
  req.userID = UID;
  userID = UID;

  // db.getDb()
  //   .db()
  //   .collection("User")
  //   .findOne({ _id: new mongodb.ObjectId(userID) })
  //   .then((resp) => {
  //     if (resp) {
  //       const type = resp.type;
  //       req.type = type === "admin" || type === "lecturer";
  //     } else {
  //       req.type = false;
  //     }
  //   })
  //   .catch((er) => {
  //     console.log(er);
  //   });

  req.auth = true;
  next();
};
