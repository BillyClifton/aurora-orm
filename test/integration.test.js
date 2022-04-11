"use strict";
require("dotenv").config();
const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION || "us-east-1" });
const DB = require("../index.js")({
  secretArn: process.env.DB_CREDENTIALS,
  resourceArn: process.env.DB_HOST,
  database: process.env.DB_NAME,
});
test("Get", async () => {
  let expenses = DB.Model(require("./tables/expense.js"));
  let response = await expenses.get({ where: { merchant: "Test Merch" } });
  expect(response.data).toBeTruthy();
});
test("Get Batch", async () => {
  let expenses = DB.Model(require("./tables/expense.js"));
  let response = await expenses.get({
    where: { merchant: ["Test Merch", "another"] },
  });
  expect(response.data).toBeTruthy();
});
