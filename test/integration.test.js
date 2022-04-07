"use strict";
require("dotenv").config();
const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION || "us-east-1" });
test("Get", async () => {
  let config = {
    secretArn: process.env.DB_CREDENTIALS,
    resourceArn: process.env.DB_HOST,
    database: process.env.DB_NAME,
  };
  let connection = require("../connection.js")(config);
  let expenses = require("../index.js")(
    require("./tables/expense.js"),
    connection.query
  );
  let response = await expenses.get({ where: { merchant: "Test Merch" } });
  expect(response.data).toBeTruthy();
});
test("Get Batch", async () => {
  let config = {
    secretArn: process.env.DB_CREDENTIALS,
    resourceArn: process.env.DB_HOST,
    database: process.env.DB_NAME || "postgres",
  };
  let connection = require("../connection.js")(config);
  let expenses = require("../index.js")(
    require("./tables/expense.js"),
    connection.query
  );
  let response = await expenses.get({
    where: { merchant: ["Test Merch", "another"] },
  });
  expect(response.data).toBeTruthy();
});
