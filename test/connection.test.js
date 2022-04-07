"use strict";
require("dotenv").config();
const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION || "us-east-1" });
test("DB Driver: Select ", async () => {
  const data_service = new AWS.RDSDataService();
  let request = {
    sql: "SELECT * FROM expenses WHERE merchant IN (:1, :2) OFFSET 0 LIMIT 30",
    secretArn: process.env.DB_CREDENTIALS,
    resourceArn: process.env.DB_HOST,
    database: process.env.DB_NAME || "postgres",
    parameters: [
      { name: "1", value: { stringValue: "Tsdh" } },
      { name: "2", value: { stringValue: "woo" } },
    ],
  };
  let result = await data_service.executeStatement(request).promise();
  expect(result.records).toBeTruthy();
  expect(result.numberOfRecordsUpdated).toEqual(0);
});
// {
//   secretArn: 'arn:aws:secretsmanager:us-east-1:434025528698:secret:/api/rds-data-api/DBCredentials-QvXKWv',
//   resourceArn: 'arn:aws:rds:us-east-1:434025528698:cluster:rds-data-api-serverlessdb-dmr65w00udz0',
//   database: 'postgres',
//   sql: "SELECT * FROM expenses WHERE merchant IN :merchant OFFSET 0 LIMIT 30",
//   parameters:[{"name":"merchant","value":{"stringValue":"Test Merch"}}]
// }
