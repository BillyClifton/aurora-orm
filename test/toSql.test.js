"use strict";
require("dotenv").config();
async function MockCallback(table, sql, params) {
  return Promise.resolve(sql);
}
let expenses = require("../index")(
  require("./tables/expense.js"),
  MockCallback
);
let users = require("../index")(require("./tables/user.js"), MockCallback);
test("SELECT", () => {
  expect(expenses.get({ where: { merchant: "Test Merch" } })).resolves.toEqual(
    "SELECT * FROM expenses WHERE merchant = :1 OFFSET 0 LIMIT 30"
  );
});
test("SELECT from array", () => {
  expect(
    expenses.get({ where: { merchant: ["Test Merch", "merchB"] } })
  ).resolves.toEqual(
    "SELECT * FROM expenses WHERE merchant IN (:1,:2) OFFSET 0 LIMIT 30"
  );
});

test("Get Total", () => {
  expect(
    expenses.getTotal({ where: { merchant: "Test Merch" } })
  ).resolves.toEqual(
    "SELECT COUNT(*) FROM expenses WHERE merchant = :merchant"
  );
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
    "UPDATE users SET first_name = :first_name WHERE email = :where_email RETURNING *"
  );
});

test("Delete", () => {
  expect(users.destroy({ email: "test@email.com" })).resolves.toEqual(
    "DELETE FROM users WHERE email = :email RETURNING *"
  );
});
