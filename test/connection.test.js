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
