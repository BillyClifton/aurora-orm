module.exports = {
  name: "users",
  columns: [
    {
      name: "uuid",
      type: "uuid",
      default: "gen_random_uuid()",
      primary_key: true,
    },
    {
      name: "email",
      type: "text",
      unique: true,
    },
    {
      name: "password",
      type: "text",
    },
    {
      name: "first_name",
      type: "text",
    },
    {
      name: "last_name",
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
};
