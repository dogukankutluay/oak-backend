const express = require('express');
const router = express.Router();
const { tokenFindAndVerify } = require('../middleware/auth');
const {
  createDepositAddress,
  getDepositAddress,
  buyDepositAddress,
} = require('../controller/deposit');
router.use(tokenFindAndVerify);
router
  .post('/', createDepositAddress)
  .get('/', getDepositAddress)
  .put('/', buyDepositAddress);
module.exports = router;
