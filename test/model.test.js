"use strict";
require("dotenv").config();
async function MockCallback(sql, table, params) {
  if (!table || !params) {
    return Promise.resolve(sql);
  }
  return Promise.resolve({ data: sql });
}
const expenses = require("../model")(
  require("./tables/expense.js"),
  MockCallback
);
let users = require("../model")(require("./tables/user.js"), MockCallback);
test("SELECT", () => {
  expect(expenses.get({ where: { merchant: "Test Merch" } })).resolves.toEqual(
    "SELECT * FROM expenses WHERE merchant = :1 OFFSET 0 LIMIT 30"
  );
  expect(
    expenses.get({ where: { merchant: "Test Merch", "lt~amount": 40 } })
  ).resolves.toEqual(
    "SELECT * FROM expenses WHERE merchant = :1 AND amount < :2 OFFSET 0 LIMIT 30"
  );
  expect(
    expenses.get({ where: { merchant: ["Test Merch"], type: ["personal"] } })
  ).resolves.toEqual(
    "SELECT * FROM expenses WHERE merchant = :1 AND type = :2 OFFSET 0 LIMIT 30"
  );
  expect(
    expenses.get({
      where: {
        merchant: ["Test Merch", "Home Shop"],
        type: ["personal", "business"],
      },
    })
  ).resolves.toEqual(
    "SELECT * FROM expenses WHERE merchant IN (:1,:2) AND type IN (:3,:4) OFFSET 0 LIMIT 30"
  );
});
test("SELECT from array", () => {
  expect(
    expenses.get({ where: { merchant: ["Test Merch", "merchB"] } })
  ).resolves.toEqual(
    "SELECT * FROM expenses WHERE merchant IN (:1,:2) OFFSET 0 LIMIT 30"
  );
});

test("Select from join", () => {
  expect(
    expenses.get({
      where: {
        merchant: ["Test Merch", "merchB"],
      },
      include: {
        table: "users",
        fk_field: "user_uuid",
      },
    })
  ).resolves.toEqual(
    "SELECT * FROM expenses INNER JOIN users on expenses.user_uuid = users.uuid WHERE merchant IN (:1,:2) OFFSET 0 LIMIT 30"
  );
  expect(
    expenses.get({
      where: {
        merchant: ["Test Merch", "merchB"],
      },
      include: {
        table: "receipts",
        fk_field: "expense_uuid",
      },
    })
  ).resolves.toEqual(
    "SELECT * FROM expenses INNER JOIN receipts on receipts.expense_uuid = expenses.uuid WHERE merchant IN (:1,:2) OFFSET 0 LIMIT 30"
  );
});

test("Get Total", () => {
  expect(
    expenses.getTotal({ where: { merchant: "Test Merch" } })
  ).resolves.toEqual("SELECT COUNT(*) FROM expenses WHERE merchant = :1");
});

test("Create", () => {
  expect(
    expenses.create({ merchant: "Test Merch", amount: 30.12 })
  ).resolves.toEqual(
    "INSERT INTO expenses (merchant, amount) VALUES (:merchant, :amount) RETURNING *;"
  );
});

test("Update", () => {
  expect(
    users.update({ first_name: "john" }, { where: { email: "test@email.com" } })
  ).resolves.toEqual(
    "UPDATE users SET first_name = :first_name WHERE email = :1 RETURNING *"
  );
});

test("Delete", () => {
  expect(users.destroy({ email: "test@email.com" })).resolves.toEqual(
    "DELETE FROM users WHERE email = :1 RETURNING *"
  );
});

test("Create Table", () => {
  expect(expenses.createTable()).resolves.toEqual(
    "CREATE TABLE IF NOT EXISTS expenses (uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_uuid uuid, date date, amount decimal(12,2), merchant text, type text, description text, status text DEFAULT 'draft', note text, created_at timestamptz DEFAULT CURRENT_TIMESTAMP, updated_at timestamptz DEFAULT CURRENT_TIMESTAMP);"
  );
});

test("Create Indexes", () => {
  expect(expenses.createIndexes()).resolves.toEqual([
    "CREATE INDEX expenses_company_uuid_index ON expenses (company_uuid)",
    "CREATE INDEX expenses_company_user_uuid_index ON expenses (company_user_uuid)",
  ]);
});

test("Create Associations", () => {
  expect(expenses.createAssociations()).resolves.toEqual([
    "ALTER TABLE expenses ADD CONSTRAINT expenses_user_uuid_fk FOREIGN KEY user_uuid REFERENCES users(uuid) ON UPDATE CASCADE ON DELETE CASCADE",
  ]);
});

test("Create Trigger", () => {
  expect(expenses.createTriggers()).resolves.toEqual([
    "CREATE TRIGGER expense_updated BEFORE UPDATE ON expense FOR EACH ROW EXECUTE PROCEDURE update_timestamp()",
  ]);
});
test("Provision", () => {
  expect(expenses.provision()).resolves.toEqual([
    "CREATE EXTENSION IF NOT EXISTS pgcrypto",
    "CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER as $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$ LANGUAGE PLPGSQL;",
  ]);
});
