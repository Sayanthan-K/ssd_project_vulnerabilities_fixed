const mongodb = require('mongodb');
const db = require('../db');
const fileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const e = require('express');
const cookie = require('cookie');

const nodemailer = require('nodemailer');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const { OAuth2Client } = require('google-auth-library');
const uuidv4 = require('uuid').v4;

//hash_password
function hashPassword(password) {
  return bcrypt.hashSync(password, saltRounds);
}

// Compare a plain password with a hashed password
function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

//google token verify
async function verify_google_jwtToken(google_jwtToken) {
  try {
    const client = new OAuth2Client(
      '584043774139-4l2qg934td1644ar0e6mj9019qcsnkvg.apps.googleusercontent.com'
    );
    // varify and decode it
    const ticket = await client.verifyIdToken({
      idToken: google_jwtToken,
      audience:
        '584043774139-4l2qg934td1644ar0e6mj9019qcsnkvg.apps.googleusercontent.com',
    });
    // Get the JSON with all the user info
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    console.log('Error in decoding Google token');
    return false;
  }
}

const sendEmail = (otp, email) => {
  const h1 = '<h2>OTP for reset password</h2><hr>';
  const h2 = h1 + '<h3>OTP: ' + otp + '</h3>';

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'project2020sliit@gmail.com',
      pass: 'uowh prgj ywmx ebyt',
    },
  });

  var mailOptions = {
    from: 'project2020sliit@gmail.com',
    to: email,
    subject: 'OTP',
    html: h2,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      // return false
    } else {
      console.log('Email sent: ' + info.response);
      // return true
    }
  });
};

exports.Login = (req, res, next) => {
  db.getDb()
    .db()
    .collection('User')
    .findOne({
      email: req.body.email,
    })
    .then((resp) => {
      if (resp) {
        const isPasswordMatch = comparePassword(
          req.body.password,
          resp.password
        );

        if (!isPasswordMatch) {
          return res.status(401).json({ auth: false });
        }

        const accessToken = jwt.sign(
          { userID: resp._id, email: resp.email },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '5m' }
        );
        res.cookie('jwtAcc', accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 1000,
        });

        const refreshToken = jwt.sign(
          { userID: resp._id, email: resp.email, password: resp.password },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '15m' }
        );

        res.cookie('jwt', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 1000,
        });

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

exports.refresh = (req, res) => {
  const cookies = cookie.parse(req.headers.cookie || '');

  if (!cookies?.jwt) return res.status(401).json({ message: 'unauthorized' });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Forbidden' });

      db.getDb()
        .db()
        .collection('User')
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
              maxAge: 7 * 24 * 60 * 1000,
            });

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
    }
  );
};

exports.logout = (req, res) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  if (!cookies?.jwt) return res.sendStatus(204);
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: true });
  res.clearCookie('jwtAcc', {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
  });
  console.log('cookie cleared');
  return res(200).json({ message: 'cookie cleared' });
};

exports.CheckMail = (req, res, next) => {
  db.getDb()
    .db()
    .collection('User')
    .findOne({ email: req.query.email })
    .then((resp) => {
      if (resp) {
        const userID = resp._id;

        const OTP = Math.floor(Math.random() * 89999) + 10000;
        db.getDb()
          .db()
          .collection('OTP')
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
    .collection('OTP')
    .findOne({ email: req.body.email, OTP: parseInt(req.body.otp) })
    .then((resp) => {
      if (resp) {
        res.status(200).json({ valid: true, email: req.body.email });
      } else {
        res.status(200).json({ valid: false });
      }
    })
    .catch(() => {});
};

exports.FindUser = (req, res, next) => {
  db.getDb()
    .db()
    .collection('User')
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
    .catch(() => {});
};

exports.GetUser = (req, res, next) => {
  console.log(req.query.ID);
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
    .collection('User')
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
    .collection('User')
    .updateOne(
      {
        _id: new mongodb.ObjectId(req.body._id),
      },
      {
        $set: {
          name: req.body.name,
          address: req.body.address,
          contact: req.body.contact,
          password: hashPassword(req.body.password),
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
    !poster.mimetype.includes('image/jpeg') ||
    !(poster.size / (1024 * 1024) < 5)
  ) {
    res.status(200).json({ file: false });
    return;
  }

  poster.mv('Dp/' + fileName, (error) => {
    if (error) {
      res.status(200).json({ ack: false });
    } else {
      const dp = 'http://localhost:5000/Dp/' + fileName;

      db.getDb()
        .db()
        .collection('User')
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
    .collection('User')
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
    .collection('User')
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
    .collection('Enroll')
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
    .collection('Enroll')
    .updateOne(
      {
        _id: new mongodb.ObjectId(req.body.ID),
      },

      { $pull: { students: req.body.student } }
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
    .collection('User')
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
          .collection('OTP')
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
    .collection('OTP')
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

exports.GoogleLogin = async (req, res, next) => {
  // console.log(req.body.credential);
  const user_data = await verify_google_jwtToken(req.body.credential);
  if (!user_data) {
    res.status(401).json({ auth: false });
  }

  db.getDb()
    .db()
    .collection('User')
    .findOne({
      email: user_data.email,
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
          maxAge: 7 * 24 * 60 * 1000,
        });

        const refreshToken = jwt.sign(
          { userID: resp._id, email: resp.email, password: resp.password },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '15m' }
        );

        res.cookie('jwt', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 1000,
        });

        return res.status(200).json({
          auth: true,
          details: resp,
          token: accessToken,
          tokenExpiration: 1,
        });
      } else {
        new_userid = uuidv4();
        db.getDb()
          .db()
          .collection('User')
          .insertOne({
            name: user_data.name,
            email: user_data.email,
            type: 'student',
            ID: new_userid,
            password: 'GOOGLE SIGIN - No Need for password',
            IDNo: '',
            date: '',
            contact: 'GOOGLE SIGIN - Please update',
            address: 'GOOGLE SIGIN - Please update',
            faculty: 'Computing',
          })
          .then((resp) => {
            if (resp.insertedId) {
              const accessToken = jwt.sign(
                { userID: resp.insertedId, email: user_data.email },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '5m' }
              );
              res.cookie('jwtAcc', accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 1000,
              });

              const refreshToken = jwt.sign(
                {
                  userID: resp.insertedId,
                  email: user_data.email,
                  password: 'GOOGLE SIGIN - No Need for password',
                },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '15m' }
              );

              res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 1000,
              });

              const mine_new_resp = {
                _id: resp.insertedId,
                name: user_data.name,
                type: 'student',
                ID: new_userid,
              };
              return res.status(200).json({
                auth: true,
                details: mine_new_resp,
                token: accessToken,
                tokenExpiration: 1,
              });
            } else {
              res.status(200).json({ error: true });
            }
          })
          .catch((er) => {
            res.status(200).json({ error: true });
          });
      }
    })
    .catch(() => {
      res.status(200).json({ auth: false });
    });
};
