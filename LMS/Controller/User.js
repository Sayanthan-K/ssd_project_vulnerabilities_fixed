const mongodb = require("mongodb");
const db = require("../db");
const fileUpload = require("express-fileupload");
const jwt = require("jsonwebtoken");
const e = require("express");
const cookie = require('cookie');
const useragent = require('useragent');
const nodemailer = require('nodemailer');


const sendEmail = (otp, email) => {
  const h1 = "<h2>OTP for reset password</h2><hr>";
  const h2 = h1 + "<h3>OTP: " + otp + "</h3>";

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "project2020sliit@gmail.com",
      pass: "sliit2020",
    },
  });

  var mailOptions = {
    from: "project2020sliit@gmail.com",
    to: email,
    subject: "OTP",
    html: h2,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      // return false
    } else {
      console.log("Email sent: " + info.response);
      // return true
    }
  });
};


exports.Login = (req, res, next) => {
  db.getDb()
    .db()
    .collection("User")
    .findOne({
      email: req.body.email,
      password: req.body.password,
    })
    .then((resp) => {
      if (resp) {
        const userAgentHeader = req.headers['user-agent'];
        const agent = useragent.parse(userAgentHeader);
        const browserVersion = agent.toVersion();
        const browserFamily = agent.family;
        const os = agent.os.family;
        const osVersion = agent.os.toVersion();

        const accessToken = jwt.sign(
          { userID: resp._id, 
            email: resp.email, 
            browserVersion:browserVersion,
            browserFamily:browserFamily,
            os:os,
            osVersion:osVersion
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '1m' }
        );
        res.cookie('jwtAcc', accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 1000,
        })

        const refreshToken = jwt.sign(
          { userID: resp._id, email: 
            resp.email, 
            password: resp.password,
            browserVersion:browserVersion,
            browserFamily:browserFamily,
            os:os,
            osVersion:osVersion },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '7m' }
        )

        res.cookie('jwt', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 1000,
        })

        return res.status(200).json({
          auth: true,
          details: resp,
          token: accessToken,
          tokenExpiration: 1,
        });

      } else {
        res.status(200).json({ auth: false });
      }
    })
    .catch(() => {
      res.status(200).json({ auth: false });
    });
};




exports.logout = (req, res) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  if (!cookies?.jwt) return res.sendStatus(204)
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: true })
  res.clearCookie('jwtAcc', { httpOnly: true, sameSite: 'strict', secure: true })
  console.log("cookie cleared")
  return res(200).json({ message: 'cookie cleared' })
}



exports.refresh = (req, res) => {
  const cookies = cookie.parse(req.headers.cookie || '');

  if (!cookies?.jwt) return res.status(401).json({ message: 'unauthorized' })

  const refreshToken = cookies.jwt

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Forbidden' })

      db.getDb()
        .db()
        .collection("User")
        .findOne({
          email: decoded.email,
          password: decoded.password,
        })
        .then((resp) => {
          if (resp) {
            const accessToken = jwt.sign(
              { userID: resp._id, email: resp.email },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: '5m' }
            );

            res.cookie('jwtAcc', accessToken, {
              httpOnly: true,
              secure: true,
              sameSite: 'strict',
              maxAge: 7 * 24 * 60 * 1000
            })

            res.status(200).json({
              auth: true,
              details: resp,
              token: accessToken,
              tokenExpiration: 1,
            });
          } else {
            res.status(200).json({ auth: false });
          }
        })
        .catch(() => {
          res.status(200).json({ auth: false });
        });
    })
}


exports.CheckMail = (req, res, next) => {
  db.getDb()
    .db()
    .collection("User")
    .findOne({ email: req.query.email })
    .then((resp) => {

      if (resp) {
        const userID = resp._id;



        const OTP = Math.floor(Math.random() * 89999) + 10000;
        db.getDb()
          .db()
          .collection("OTP")
          .insertOne({ userID, email: req.query.email, OTP: OTP })
          .then((resp) => {

            sendEmail(OTP, req.query.email);

            res.status(200).json({ available: true, userID });
          });
      } else {
        res.status(200).json({ available: false });
      }
    })
    .catch((er) => {
      console.log(er);
    });
};

exports.CheckOTP = (req, res, next) => {
  db.getDb()
    .db()
    .collection("OTP")
    .findOne({ email: req.body.email, OTP: parseInt(req.body.otp) })
    .then((resp) => {
      if (resp) {
        res.status(200).json({ valid: true, email: req.body.email });
      } else {
        res.status(200).json({ valid: false });
      }
    })
    .catch(() => { });
};

exports.FindUser = (req, res, next) => {
  db.getDb()
    .db()
    .collection("User")
    .findOne({
      _id: new mongodb.ObjectId(req.body._id),
    })
    .then((resp) => {
      if (resp) {
        res.status(200).json(resp);
      } else {
        res.status(200).json({ auth: false });
      }
    })
    .catch(() => { });
};

exports.GetUser = (req, res, next) => {
  if (req.auth === false) {
    res.status(200).json({ auth: false });
    return;
  }
  if (req.query.ID.length !== 24) {
    res.status(200).json({ fetch: false });
    return;
  }
  db.getDb()
    .db()
    .collection("User")
    .findOne({
      _id: new mongodb.ObjectId(req.query.ID),
    })
    .then((resp) => {
      if (resp) {
        res.status(200).json(resp);
      } else {
        res.status(200).json({ fetch: false });
      }
    })
    .catch(() => {
      res.status(200).json({ fetch: false });
    });
};

exports.EditUser = (req, res, next) => {
  if (req.auth === false) {
    res.status(200).json({ auth: false });
    return;
  }
  if (req.body._id.length !== 24) {
    res.status(200).json({ ack: false });
    return;
  }

  db.getDb()
    .db()
    .collection("User")
    .updateOne(
      {
        _id: new mongodb.ObjectId(req.body._id),
      },
      {
        $set: {
          name: req.body.name,
          address: req.body.address,
          contact: req.body.contact,
          password: req.body.password,
          bio: req.body.bio,
        },
      }
    )
    .then((resp) => {
      if (resp.modifiedCount === 1) {
        res.status(200).json({ ack: true });
      } else {
        res.status(200).json({ ack: false });
      }
    })
    .catch((er) => {
      res.status(200).json({ ack: false, msg: er });
    });
};

exports.AddDP = (req, res, next) => {
  if (req.auth === false) {
    res.status(200).json({ auth: false });
    return;
  }
  if (req.body._id.length !== 24) {
    res.status(200).json({ ack: false });
    return;
  }

  let poster = req.files.dp;
  const fileName = req.body._id + poster.name;

  if (
    !poster.mimetype.includes("image/jpeg") ||
    !(poster.size / (1024 * 1024) < 5)
  ) {
    res.status(200).json({ file: false });
    return;
  }

  poster.mv("Dp/" + fileName, (error) => {
    if (error) {
      res.status(200).json({ ack: false });
    } else {
      const dp = "http://localhost:5000/Dp/" + fileName;

      db.getDb()
        .db()
        .collection("User")
        .updateOne(
          { _id: new mongodb.ObjectId(req.body._id) },
          {
            $set: {
              dp: dp,
            },
          }
        )
        .then((resp) => {
          if (resp.modifiedCount === 1) {
            res.status(200).json({ ack: true });
          } else {
            res.status(200).json({ ack: false });
          }
        })
        .catch(() => {
          res.status(200).json({ ack: false });
        });
    }
  });
};

exports.GetDP = (req, res, next) => {
  if (req.auth === false) {
    res.status(200).json({ auth: false });
    return;
  }
  if (req.query.ID.length !== 24) {
    res.status(200).json({ available: false });
    return;
  }
  db.getDb()
    .db()
    .collection("User")
    .findOne({
      _id: new mongodb.ObjectId(req.query.ID),
    })
    .then((resp) => {
      if (resp) {
        res.status(200).json({ dp: resp.dp, name: resp.name });
      } else {
        res.status(200).json({ available: false });
      }
    })
    .catch((er) => {
      res.status(200).json({ available: false, msg: er });
    });
};

exports.DeleteUser = (req, res, next) => {
  if (req.auth === false) {
    res.status(200).json({ auth: false });
    return;
  }
  if (req.query.ID.length !== 24) {
    res.status(200).json({ ack: false });
    return;
  }
  db.getDb()
    .db()
    .collection("User")
    .deleteOne({
      _id: new mongodb.ObjectId(req.query.ID),
    })
    .then((resp) => {
      if (resp.deletedCount === 1) {
        res.status(200).json({ ack: true });
      } else {
        res.status(200).json({ ack: false });
      }
    })
    .catch((er) => {
      res.status(200).json({ ack: false, msg: er });
    });
};

exports.GetModules = (req, res, next) => {
  if (req.auth === false) {
    res.status(200).json({ auth: false });
    return;
  }
  db.getDb()
    .db()
    .collection("Enroll")
    .find(
      {
        students: req.query.ID,
      },
      { students: -1 }
    )
    .toArray()
    .then((resp) => {
      if (resp) {
        res.status(200).json({ courses: resp });
      } else {
        res.status(200).json({ available: false });
      }
    })
    .catch((er) => {
      res.status(200).json({ msg: er });
    });
};

exports.Unenroll = (req, res, next) => {
  if (req.auth === false) {
    res.status(200).json({ auth: false });
    return;
  }
  if (req.body.ID.length !== 24) {
    res.status(200).json({ ack: false });
    return;
  }
  db.getDb()
    .db()
    .collection("Enroll")
    .updateOne(
      {
        _id: new mongodb.ObjectId(req.body.ID),
      },


      { $pull: { students: req.body.student }, }

    )
    .then((resp) => {
      if (resp.modifiedCount === 1) {
        res.status(200).json({ ack: true });
      } else {
        res.status(200).json({ ack: false });
      }
    })
    .catch(() => {
      res.status(200).json({ ack: false });
    });
};

exports.ResetPass = (req, res, next) => {
  if (req.body._id.length !== 24) {
    res.status(200).json({ ack: false });
    return;
  }
  db.getDb()
    .db()
    .collection("User")
    .updateOne(
      {
        _id: new mongodb.ObjectId(req.body._id),
      },
      { $set: { password: req.body.password } }
    )
    .then((resp) => {
      if (resp.modifiedCount === 1) {
        db.getDb()
          .db()
          .collection("OTP")
          .deleteOne({ userID: new mongodb.ObjectId(req.body._id) })
          .then((resp) => {
            res.status(200).json({ ack: true });
          })
          .catch();
      } else {
        res.status(200).json({ ack: false });
      }
    })
    .catch((er) => {
      res.status(200).json({ ack: false });
    });
};

exports.CheckValidity = (req, res, next) => {
  if (req.query.userID.length !== 24) {
    res.status(200).json({ ack: false });
    return;
  }
  db.getDb()
    .db()
    .collection("OTP")
    .findOne({
      userID: new mongodb.ObjectId(req.query.userID),
    })
    .then((resp) => {
      if (resp) {
        res.status(200).json({ ack: true });
      } else {
        res.status(200).json({ ack: false });
      }
    })
    .catch((er) => {
      res.status(200).json({ ack: false });
    });
};
// exports.GetPassword =  (req, res, next) => {


//   db.getDb()
//     .db()
//     .collection("User")
//     .findOne({ _id: new mongodb.ObjectId(req.query.ID) })
//     .then((resp) => {
//        console.log(resp);
//       if (!resp) {
//         res.status(200).json({ error: "no jobs at the moment" });
//       } else {
//         res.status(200).json(resp);
//       }
//     })
//     .catch((er) => {
//       console.log(er);
//     });
//   }



