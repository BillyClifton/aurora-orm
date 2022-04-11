"use strict";
module.exports = function (config) {
  const model = require("./model.js");
  const connection = require("./connection.js")(config);
  return {
    Model: (schema) => model(schema, connection.query),
    Connection: connection,
  };
};
