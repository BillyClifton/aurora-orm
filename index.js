"use strict";
module.exports = function (config) {
  const model = require("./model.js");
  const connection = require("./connection.js")(config);
  return {
    model: (schema) => model(schema, connection.query),
    connection: connection,
  };
};
