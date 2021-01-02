import UserModel, { User } from "../models/user";
import * as express from "express";
import { extend } from "lodash";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";
import { OAuth2Client } from "google-auth-library";

sgMail.setApiKey(process.env.MAIL_KEY);

export const localSignInController = async (
  req: express.Request,
  res: express.Response
) => {
  console.log(req.body);
  const { email, password } = req.body;
  UserModel.findOne({
    email,
  }).exec((err: any, user: any) => {
    if (user) {
      return res.status(400).json({
        errors: "Email is taken",
      });
    }
  });

  try {
    await new UserModel({
      email,
      password,
      strategy: "LOCAL",
      name: " ",
      college: "",
      id: `usr_${uuidv4()}`,
    })
      .save()
      .then((user) => {
        const token = jwt.sign(
          {
            _id: user._id,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );
        res
          .json({ token, user: { _id: user._id, email: user.email } })
          .sendStatus(201);
      });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
    return;
  }
};

export const localLoginController = (
  req: express.Request,
  res: express.Response
) => {
  const { email, password } = req.body;
  UserModel.findOne({
    email,
  }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        errors: "User with that email does not exist. Please signup",
      });
    }

    if (user.strategy !== "LOCAL") {
      return res.status(403).json({ error: "Invalid login strategy" });
    }
    // authenticate
    if (password != user.password) {
      return res.status(400).json({
        errors: "Email and password do not match",
      });
    }
    // generate a token and send to client
    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    const { _id, email, step } = user;

    return res.json({
      token,
      user: {
        _id,
        step,
        email,
      },
    });
  });
};

export const forgotPasswordController = (
  req: express.Request,
  res: express.Response
) => {
  const { email } = req.body;

  UserModel.findOne(
    {
      email,
    },
    (err: any, user: any) => {
      if (err || !user) {
        return res.status(400).json({
          error: "User with that email does not exist",
        });
      }

      const token = jwt.sign(
        {
          _id: user._id,
        },
        process.env.JWT_RESET_PASSWORD,
        {
          expiresIn: "10m",
        }
      );

      const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Password Reset link`,
        html: `
                      <h1>Please use the following link to reset your password</h1>
                      <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
                      <hr />
                      <p>This email may contain sensetive information</p>
                      <p>${process.env.CLIENT_URL}</p>
                  `,
      };

      return user.updateOne(
        {
          resetPasswordLink: token,
        },
        (err: any, success: any) => {
          if (err) {
            console.log("RESET PASSWORD LINK ERROR", err);
            return res.status(400).json({
              error:
                "Database connection error on user password forgot request",
            });
          } else {
            sgMail
              .send(emailData)
              .then((sent) => {
                // console.log('SIGNUP EMAIL SENT', sent)
                return res.json({
                  message: `Email has been sent to ${email}. Follow the instruction to activate your account`,
                });
              })
              .catch((err) => {
                // console.log('SIGNUP EMAIL SENT ERROR', err)
                return res.json({
                  message: err.message,
                });
              });
          }
        }
      );
    }
  );
};

export const updatePassword = (req: express.Request, res: express.Response) => {
  const { resetPasswordLink, newPassword } = req.body;

  if (resetPasswordLink) {
    jwt.verify(
      resetPasswordLink,
      process.env.JWT_RESET_PASSWORD,
      function (err: any, decoded: any) {
        if (err) {
          return res.status(400).json({
            error: "Expired link. Try again",
          });
        }

        UserModel.findOne(
          {
            resetPasswordLink,
          },
          (err: any, user: any) => {
            if (err || !user) {
              return res.status(400).json({
                error: "Something went wrong. Try later",
              });
            }

            const updatedFields = {
              password: newPassword,
              resetPasswordLink: "",
            };

            user = extend(user, updatedFields);

            user.save((err: any, result: any) => {
              if (err) {
                return res.status(400).json({
                  error: "Error resetting user password",
                });
              }
              res.json({
                message: `Great! Now you can login with your new password`,
              });
            });
          }
        );
      }
    );
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT);

export const googleController = (
  req: express.Request,
  res: express.Response
) => {
  const { idToken } = req.body;

  client
    .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT })
    .then((response) => {
      console.log("GOOGLE LOGIN RESPONSE", response);
      const { email_verified, name, email } = response.getPayload();
      if (email_verified) {
        UserModel.findOne({ email }).exec((err, user) => {
          if (user) {
            if (user.strategy !== "GOOGLE") {
              return res.status(403).json({ error: "Invalid login strategy" });
            }

            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: "7d",
            });
            const { _id, email, name, step } = user;

            return res.json({
              token,
              user: { _id, email, name, step },
            });
          } else {
            let password = email;
            user = new UserModel({
              id: `usr_${uuidv4()}`,
              name: "",
              email,
              password,
              strategy: "GOOGLE",
              phone: "",
              college: "",
              city: "",
            });
            console.log(user);
            user.save((err, data) => {
              if (err) {
                console.log("ERROR GOOGLE LOGIN ON USER SAVE", err);
                return res.status(400).json({
                  error: "User signup failed with google",
                });
              }
              const token = jwt.sign(
                { _id: data._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
              );
              const { _id, email, name, step } = data;
              return res.json({
                token,
                user: { _id, email, name, step },
              });
            });
          }
        });
      } else {
        return res.status(400).json({
          error: "Google login failed. Try again",
        });
      }
    });
};
