const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { makeId } = require('../helpers/makeId');
const sendSms = require('../services/sendSms');
const Schema = mongoose.Schema;
const UserSchema = new Schema(
  {
    name: String,
    surname: String,
    email: {
      type: String,
    },
    phone: {
      type: String,
      index: true,
    },
    password: String,
    role: {
      type: String,
      default: 'User',
      enum: ['User', 'Admin'],
    },
    registerAccess: {
      confirm: {
        type: Boolean,
        default: false,
      },
      code: String,
    },
    forgotPassword: {
      confirm: {
        type: Boolean,
      },
      code: String,
    },
    tokenBalance: {
      type: Number,
      default: 0,
    },
    usdtBalance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) next(err);
      this.password = hash;
      next();
    });
  });
});
UserSchema.methods.generateTokenJwt = function () {
  const jwtToken = require('jsonwebtoken');
  const { JWT_SECRET, JWT_EXPIRE } = process.env;
  const payloud = {
    _id: this._id,
    name: this.name,
  };
  const token = jwtToken.sign(payloud, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
    algorithm: 'HS256',
  });
  return token;
};
UserSchema.methods.sendSmsForRegisterConfirmation = function () {
  const code = makeId(6);
  const message = `Code required for account confirmation ${code}`;
  const result = sendSms(`90${this.phone}`, message);
  this.registerAccess.code = code;
  return result;
};
UserSchema.methods.sendSmsForForgotPasswordConfirmation = function () {
  const code = makeId(6);
  const message = `Code required for forgot password confirmation ${code}`;
  const result = sendSms(`90${this.phone}`, message);
  this.forgotPassword.confirm = false;
  this.forgotPassword.code = code;
  return result;
};
module.exports = mongoose.model('User', UserSchema);
