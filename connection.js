"use strict";
module.exports = function (config) {
  const AWS = require("aws-sdk");
  AWS.config.update({ region: process.env.AWS_REGION || "us-east-1" });
  return {
    query: async (table, sql, args) => {
      try {
        const data_service = new AWS.RDSDataService();
        let response;
        let request = {
          sql: sql,
          ...config,
        };
        if (!args) {
          response = await data_service.executeStatement(request).promise();
          return response;
        }
        if (!Array.isArray(args)) {
          args = [args];
        }
        let params = args.map((arg) => {
          return Object.keys(arg).map((key) => {
            let param = {
              name: key,
            };
            if (arg[key].value == null) {
              param.isNull = true;
              return param;
            }
            //typeHint: JSON | UUID | TIMESTAMP | DATE | TIME | DECIMAL,
            if (arg[key].type.startsWith("decimal")) {
              param.typeHint = "DECIMAL";
              param.value = { doubleValue: arg[key].value };
              return value;
            }
            switch (arg[key].type) {
              case "text":
                param.value = { stringValue: arg[key].value };
                break;
              case "uuid":
                param.typeHint = "UUID";
                param.value = { stringValue: arg[key].value };
                break;
              case "json":
                param.typeHint = "JSON";
                param.value = { stringValue: arg[key].value };
                break;
              case "timestamptz":
                param.typeHint = "TIMESTAMP";
                param.value = { stringValue: arg[key].value };
                break;
              case "date":
                param.typeHint = "DATE";
                param.value = { stringValue: arg[key].value };
                break;
              case "time":
                param.typeHint = "TIME";
                param.value = { stringValue: arg[key].value };
                break;
              case "decimal":
                param.typeHint = "DECIMAL";
                param.value = { doubleValue: arg[key].value };
                break;
              case "boolean":
                param.value = { booleanValue: arg[key].value };
                break;
              case "bigint":
              case "integer":
              case "int":
                param.value = { longValue: arg[key].value };
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
        // console.debug(request)
        // console.debug(JSON.stringify(response));

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
  };
};
