"use strict";
module.exports = function (table, callback) {
  function buildWhere(where) {
    let sql = "";
    let params = {};
    let x = 1;
    if (Object.keys(where).length) {
      sql += ` WHERE ${Object.keys(where)
        .map((key) => {
          let field = key.replace(/^.*~/, "");
          if (Array.isArray(where[key]) && where[key].length == 1) {
            where[key] = where[key][0];
          }
          if (Array.isArray(where[key])) {
            return `${key} IN (:${where[key]
              .map((entry) => {
                params[x.toString()] = {
                  type: table.columns.find((column) => column.name == field)
                    .type,
                  value: entry,
                };
                return x++;
              })
              .join(",:")})`;
          } else {
            params[x.toString()] = {
              type: table.columns.find((column) => column.name == field).type,
              value: where[key],
            };
            if (key.startsWith("lt~")) {
              return `${field} < :${x++}`;
            }
            if (key.startsWith("gt~")) {
              return `${field} > :${x++}`;
            }
            if (key.startsWith("lte~")) {
              return `${field} <= :${x++}`;
            }
            if (key.startsWith("gte~")) {
              return `${field} >= :${x++}`;
            }
            if (key.startsWith("like~")) {
              params[x.toString()].value = `%${params[x.toString()].value}%`;
              return `${field} ILIKE :${x++}`;
            }
            return `${field} = :${x++}`;
          }
        })
        .join(" AND ")}`;
    }
    return [sql, params];
  }

  return {
    get: async ({
      fields = ["*"],
      where = {},
      limit = 30,
      offset = 0,
      include,
    }) => {
      try {
        // let valid_fields = table.collums.map(collum=>collumn.name)
        // fields = sanatize(fields);
        // if(fields == ["*"] || !fields.every(field => valid_fields.includes(field) || "*")){
        //   throw Error(`Invalid projection fields.`);
        // }
        // if(!Object.keys(where).every(field => valid_fields.includes(field.replace(/^.*~/, "")) || "*")){
        //   throw Error(`Invalid condition fields.`);
        // }
        let sql = `SELECT ${fields.join(", ")} FROM ${table.name}`;
        if (include) {
          if (table.columns.find((column) => column.name == include.fk_field)) {
            sql += ` INNER JOIN ${include.table} on ${table.name}.${include.fk_field} = ${include.table}.uuid`;
          } else {
            sql += ` INNER JOIN ${include.table} on ${include.table}.${include.fk_field} = ${table.name}.uuid`;
          }
        }
        let x = 0;
        // let params = {};
        let [where_sql, params] = buildWhere(where);
        sql += where_sql;
        sql += ` OFFSET ${offset} LIMIT ${limit}`;
        let results = await callback(sql, table, params);
        return results;
      } catch (error) {
        return error;
      }
    },
    getTotal: async ({ where = {}, include }) => {
      try {
        let sql = `SELECT COUNT(*) FROM ${table.name}`;
        if (include) {
          if (table.columns.find((column) => column.name == include.fk_field)) {
            sql += ` INNER JOIN ${include.table} on ${table.name}.${include.fk_field} = ${include.table}.uuid`;
          } else {
            sql += ` INNER JOIN ${include.table} on ${include.table}.${include.fk_field} = ${table.name}.uuid`;
          }
        }
        let [where_sql, params] = buildWhere(where);
        sql += where_sql;
        let results = await callback(sql, table, params);
        return results;
      } catch (error) {
        return error;
      }
    },
    create: async (records) => {
      try {
        let fields = Object.keys(Array.isArray(records) ? records[0] : records);
        if (!Array.isArray(records)) {
          records = [records];
        }
        let sql = `INSERT INTO ${table.name} (${fields.join(
          ", "
        )}) VALUES (:${fields.join(", :")}) RETURNING *;`;
        // return sql;
        let params = records.map((record) => {
          return Object.keys(record).map((key) => {
            return {
              type: table.columns.find((column) => column.name == key).type,
              value: record[key],
            };
          });
        });
        return await callback(sql, table, params);
        // return results;
      } catch (error) {
        return error;
      }
    },
    update: async (data, params) => {
      try {
        if (!params.where) {
          throw new Error("No scope defined for for update.");
        }
        let where = params.where;
        let sql = `UPDATE ${table.name} SET ${Object.keys(data)
          .map((key) => `${key} = :${key}`)
          .join(", ")} WHERE ${Object.keys(where)
          .map((key) => `${key} = :where_${key}`)
          .join(" AND ")} RETURNING *`;
        for (const [key, value] of Object.entries(where)) {
          data[`where_${key}`] = value;
        }
        let response = await callback(sql, table, data);
        return response;
      } catch (error) {
        return error;
      }
    },
    destroy: async (where) => {
      try {
        let sql = `DELETE FROM ${table.name}`;
        sql += ` WHERE ${Object.keys(where)
          .map((key) => `${key} = :${key}`)
          .join(" AND ")} RETURNING *`;
        let response = await callback(sql, table, where);
        console.Console;
        return response;
      } catch (error) {
        return error;
      }
    },
    createTable: async () => {
      try {
        let sql = `CREATE TABLE IF NOT EXISTS ${table.name}`;
        let columns = table.columns.map((column) => {
          let statement = `${column.name} ${column.type}`;
          statement += column.primary_key ? ` PRIMARY KEY` : "";
          statement += column.unique ? ` UNIQUE` : "";
          statement += column.not_null ? ` NOT NULL` : "";
          statement += column.default ? ` DEFAULT ${column.default}` : "";
          statement += column.check ? ` CHECK ${column.check}` : "";
          return statement;
        });
        sql += ` (${columns.join(", ")});`;
        return await callback(sql, table);
      } catch (error) {
        return error;
      }
    },
    createIndexes: async () => {
      let statements = table.indexes.map(async (index) => {
        if (typeof index == "string") {
          index = { name: index, fields: [index] };
        }
        let sql = `CREATE`;
        sql += index.unique ? ` UNIQUE INDEX` : " INDEX";
        sql += index.name
          ? ` ${table.name}_${index.name}_index`
          : ` ${table.name}_${index.fields.join("_")}_index`;
        sql += ` ON ${table.name} (${index.fields.join(", ")})`;
        return callback(sql, table);
      });
      return await Promise.all(statements);
    },
    createAssociations: async () => {
      let statements = table.columns
        .filter((column) => column.reference)
        .map(async (column) => {
          let statement = `ALTER TABLE ${table.name} ADD CONSTRAINT ${table.name}_${column.name}_fk FOREIGN KEY ${column.name} REFERENCES ${column.reference.table}`;
          statement += column.reference.field
            ? `(${column.reference.field})`
            : "";
          statement += column.reference.on_update
            ? ` ON UPDATE ${column.reference.on_update}`
            : "";
          statement += column.reference.on_delete
            ? ` ON DELETE ${column.reference.on_delete}`
            : "";
          return callback(statement, table);
        });
      return await Promise.all(statements);
    },
    createTriggers: async () => {
      let statments = table.triggers.map(async (trigger) => {
        let sql = `CREATE TRIGGER ${trigger.name} BEFORE UPDATE ON ${trigger.resource} FOR EACH ROW EXECUTE PROCEDURE ${trigger.procedure}`;
        return callback(sql, table);
      });
      return await Promise.all(statments);
    },
    dropTable: async () => {
      let sql = `DROP TABLE IF EXISTS ${table.name} CASCADE`;
      return sql;
    },
    collumns: async () => {
      let sql = `SELECT * FROM information_schema.columns WHERE table_name = '${table.name}'`;
      return sql;
    },
    indexes: async () => {
      let sql = `SELECT * FROM pg_indexes WHERE schemaname='public' and tablename = '${table.name}'`;
      return sql;
    },
    tables: async () => {
      let sql = `SELECT * FROM information_schema.tables where table_schema='public'`;
      return sql;
    },
    test: async () => {
      return sql;
    },
    provision: async () => {
      return await Promise.all([
        callback("CREATE EXTENSION IF NOT EXISTS pgcrypto"),
        callback(
          "CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER as $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$ LANGUAGE PLPGSQL;"
        ),
      ]);
    },
  };
};
