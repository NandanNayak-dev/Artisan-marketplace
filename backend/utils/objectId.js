const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const requireObjectId = (res, id, fieldName) => {
  if (isValidObjectId(id)) {
    return true;
  }

  res.status(400).json({ message: `Invalid ${fieldName}` });
  return false;
};

module.exports = {
  isValidObjectId,
  requireObjectId,
};
