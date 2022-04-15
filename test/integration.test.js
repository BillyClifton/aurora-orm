"use strict";
require("dotenv").config();
const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION || "us-east-1" });
const DB = require("../index.js")({
  secretArn: process.env.DB_CREDENTIALS,
  resourceArn: process.env.DB_HOST,
  database: process.env.DB_NAME,
});

let expenses = DB.model(require("./tables/expense.js"));
let users = DB.model(require("./tables/user.js"));

test("Get", async () => {
  let response = await expenses.get({ where: { merchant: "Test Merch" } });
  expect(response.data).toBeTruthy();
});
test("Get Batch", async () => {
  let response = await expenses.get({
    where: { merchant: ["Test Merch", "another"] },
  });
  expect(response.data).toBeTruthy();
});

test("Create Table", async () => {
  expect(users.createTable()).resolves.toEqual({
    generatedFields: [],
    numberOfRecordsUpdated: 0,
  });
  expect(expenses.createTable()).resolves.toEqual({
    generatedFields: [],
    numberOfRecordsUpdated: 0,
  });
});

test("Create Expense", async () => {
  let results = await expenses.create({
    merchant: "Test Merch",
    amount: 30.12,
    date: "2022-01-01",
  });
  expect(results.data).toBeDefined();
  expect(results.data[0].merchant).toBe("Test Merch");
});
