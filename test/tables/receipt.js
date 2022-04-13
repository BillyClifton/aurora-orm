module.exports = {
  name: "receipts",
  columns: [
    {
      name: "uuid",
      type: "uuid",
      default: "gen_random_uuid()",
      primary_key: true,
    },
    {
      name: "expense_uuid",
      type: "uuid",
      reference: {
        table: "expenses",
        field: "uuid",
        on_update: "CASCADE",
        on_delete: "CASCADE",
      },
    },
    {
      name: "source_url",
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
  triggers: [
    {
      name: "receipt_updated",
      resource: "receipts",
      procedure: "update_timestamp()",
    },
  ],
};
