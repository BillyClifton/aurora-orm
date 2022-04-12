module.exports = {
  name: "expenses",
  columns: [
    {
      name: "uuid",
      type: "uuid",
      default: "gen_random_uuid()",
      primary_key: true,
    },
    {
      name: "user_uuid",
      type: "uuid",
      reference: {
        table: "users",
        field: "uuid",
        on_update: "CASCADE",
        on_delete: "CASCADE",
      },
    },
    {
      name: "date",
      type: "date",
    },
    {
      name: "amount",
      type: "decimal(12,2)",
    },
    {
      name: "merchant",
      type: "text",
    },
    {
      name: "type",
      type: "text",
    },
    {
      name: "description",
      type: "text",
    },
    {
      name: "status",
      type: "text",
      default: "'draft'",
    },
    {
      name: "note",
      type: "text",
    },
    {
      name: "created_at",
      type: "timestamptz",
      default: "CURRENT_TIMESTAMP",
    },
    {
      name: "updated_at",
      type: "timestamptz",
      default: "CURRENT_TIMESTAMP",
    },
  ],
  indexes: ["company_uuid", "company_user_uuid"],
  triggers: [
    {
      name: "expense_updated",
      resource: "expense",
      procedure: "update_timestamp()",
    },
  ],
};
