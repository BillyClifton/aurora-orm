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

test("Create Record", async () => {
  let results = await expenses.create({
    merchant: "Test Merch",
    amount: 30.12,
    date: "2022-01-01",
  });
  expect(results).toBeDefined();
  expect(results.merchant).toBe("Test Merch");
});

test("Create Batch", async () => {
  let results = await expenses.create([
    {
      merchant: "Test Merch",
      amount: 30.12,
      date: "2022-01-01",
    },
    {
      merchant: "Bobs Shop",
      amount: 130.1,
      date: "2022-01-01",
    },
  ]);
  expect(results).toBeDefined();
  expect(results[0].merchant).toEqual("Test Merch");
  expect(results[1].merchant).toEqual("Bobs Shop");
});
test("Get", async () => {
  await expenses.create({
    merchant: "Test Merch",
    amount: 30.12,
    date: "2022-01-01",
  });
  let response = await expenses.get({
    where: { merchant: "Test Merch", date: "2022-01-01" },
  });
  expect(response).toBeTruthy();
});
test("Get by array", async () => {
  let response = await expenses.get({
    where: { merchant: ["Test Merch", "another"] },
  });
  expect(response).toBeTruthy();
});
