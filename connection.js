"use strict";
module.exports = function (config) {
  const AWS = require("aws-sdk");
  AWS.config.update({ region: process.env.AWS_REGION || "us-east-1" });
  return {
    query: async (sql, table, args) => {
      try {
        const data_service = new AWS.RDSDataService();
        let response;
        let request = {
          sql: sql,
          ...config,
        };
        if (!table || !args) {
          response = await data_service.executeStatement(request).promise();
          return response;
        }
        //prepare params
        if (!Array.isArray(args)) {
          args = [args];
        }
        let params = args.map((arg) => {
          return Object.keys(arg).map((key) => {
            let param = {
              name: arg[key].name || key,
              value: arg[key].name || arg[key],
            };
            if (param.value == null) {
              param.isNull = true;
              return param;
            }
            let type = table.columns.find(
              (column) => column.name == param.name
            ).type;
            //typeHint: JSON | UUID | TIMESTAMP | DATE | TIME | DECIMAL,
            if (type.startsWith("decimal")) {
              param.typeHint = "DECIMAL";
              param.value = { doubleValue: param.value };
              return param;
            }
            switch (type) {
              case "text":
                param.value = { stringValue: param.value };
                break;
              case "uuid":
                param.typeHint = "UUID";
                param.value = { stringValue: param.value };
                break;
              case "json":
                param.typeHint = "JSON";
                param.value = { stringValue: param.value };
                break;
              case "timestamptz":
                param.typeHint = "TIMESTAMP";
                param.value = { stringValue: param.value };
                break;
              case "date":
                param.typeHint = "DATE";
                param.value = { stringValue: param.value };
                break;
              case "time":
                param.typeHint = "TIME";
                param.value = { stringValue: param.value };
                break;
              case "decimal":
                param.typeHint = "DECIMAL";
                param.value = { doubleValue: param.value };
                break;
              case "boolean":
                param.value = { booleanValue: param.value };
                break;
              case "bigint":
              case "integer":
              case "int":
                param.value = { longValue: param.value };
                break;
            }
            return param;
          });
        });
        if ((params.length = 1)) {
          request.parameters = params[0];
          response = await data_service.executeStatement(request).promise();
        } else {
          request.parameterSets = params;
          response = await data_service
            .batchExecuteStatement(request)
            .promise();
        }
        //format response
        let records =
          response.records ||
          (response.updateResults &&
            response.updateResults.map((result) => result.generatedFields)) ||
          [];
        let fields = table.columns.map((column) => column.name);
        let results = [];
        for (let record of records) {
          let data = {};
          for (let x = 0; x < fields.length - 1; x++) {
            if (record[x].isNull) {
              data[fields[x]] = null;
            } else {
              data[fields[x]] = Object.values(record[x])[0];
            }
          }
          results.push(data);
        }
        return {
          data: results,
          updated: response.numberOfRecordsUpdated,
        };
      } catch (error) {
        console.error(error);
        return error;
      }
    },
    provision: async () => {
      const data_service = new AWS.RDSDataService();
      let responses = [
        data_service
          .executeStatement({
            sql: "CREATE EXTENSION IF NOT EXISTS pgcrypto",
            ...config,
          })
          .promise(),
        data_service
          .executeStatement({
            sql: "CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER as $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$ LANGUAGE PLPGSQL;",
            ...config,
          })
          .promise(),
      ];
      return await Promise.all(responses);
    },
  };
};
