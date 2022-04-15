"use strict";
require("dotenv").config();
const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION || "us-east-1" });
const connection = require("../connection.js")({
  secretArn: process.env.DB_CREDENTIALS,
  resourceArn: process.env.DB_HOST,
  database: process.env.DB_NAME,
});
test("Query", async () => {
  expect(connection.query("SELECT 1=1")).resolves.toEqual({
    numberOfRecordsUpdated: 0,
    records: [[{ booleanValue: true }]],
  });
});

test("Build Single parameters", async () => {
  expect(
    connection.buildParams([
      { name: "1", type: "text", value: "Test Merch" },
      { name: "2", type: "text", value: "Home Shop" },
      { name: "3", type: "text", value: "personal" },
      { name: "4", type: "text", value: "business" },
    ])
  ).toEqual([
    { name: "1", value: { stringValue: "Test Merch" } },
    { name: "2", value: { stringValue: "Home Shop" } },
    { name: "3", value: { stringValue: "personal" } },
    { name: "4", value: { stringValue: "business" } },
  ]);
});

test("Build batch parameters", async () => {
  expect(
    connection.buildParams([
      [
        { name: "merchant", value: "Test Merch", type: "text" },
        { name: "amount", value: 30.12, type: "decimal(12,2)" },
        { name: "date", value: "2022-01-01", type: "date" },
      ],
      [
        { name: "merchant", value: "Test Merch", type: "text" },
        { name: "amount", value: 30.12, type: "decimal(12,2)" },
        { name: "date", value: "2022-01-01", type: "date" },
      ],
    ])
  ).toEqual([
    [
      { name: "merchant", value: { stringValue: "Test Merch" } },
      { name: "amount", value: { doubleValue: 30.12 }, typeHint: "DECIMAL" },
      { name: "date", value: { stringValue: "2022-01-01" }, typeHint: "DATE" },
    ],
    [
      { name: "merchant", value: { stringValue: "Test Merch" } },
      { name: "amount", value: { doubleValue: 30.12 }, typeHint: "DECIMAL" },
      { name: "date", value: { stringValue: "2022-01-01" }, typeHint: "DATE" },
    ],
  ]);
});
