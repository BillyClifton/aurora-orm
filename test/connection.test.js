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

test("Build Single parameters", () => {
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

test("Build batch parameters", () => {
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
test("Format Response", () => {
  expect(
    connection.formatResponse(
      {
        numberOfRecordsUpdated: 0,
        records: [
          [
            { stringValue: "b7ad798e-2e64-4fa7-90c4-21d5b214d63e" },
            { isNull: true },
            { stringValue: "2022-01-01" },
            { stringValue: "30.12" },
            { stringValue: "Test Merch" },
            { isNull: true },
            { isNull: true },
            { stringValue: "draft" },
            { isNull: true },
            { stringValue: "2022-04-15 13:54:08.925499" },
            { stringValue: "2022-04-15 13:54:08.925499" },
          ],
        ],
      },
      require("./tables/expense.js")
    )
  ).toEqual({
    data: [
      {
        uuid: "b7ad798e-2e64-4fa7-90c4-21d5b214d63e",
        user_uuid: null,
        date: "2022-01-01",
        amount: "30.12",
        merchant: "Test Merch",
        type: null,
        description: null,
        status: "draft",
        note: null,
        created_at: "2022-04-15 13:54:08.925499",
      },
    ],
    updated: 0,
  });
});
