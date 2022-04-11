# aurora-orm

Lightweight ORM for Aurora Data API

```javascript

  //set connection configuration
  let DB = require("aurora-orm")({
    secretArn: 'arn:aws:secretsmanager:us-east-1:XXXXXXXXXXXX:secret:mySecret',
    resourceArn: 'arn:aws:rds:us-east-1:XXXXXXXXXXXX:cluster:my-cluster-name',
    database: 'myDatabase',
  })

  //Define a table schema
  let table_schema = = {
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


  //build model
  let users = DB.Model(table_schema, config);

  //query
  let response = users.get({
    where: {
      email: "Billy@email.com"
    }
  });
// [
//   {
//     uuid: '8066a2d9-155e-4b5f-8d4b-51b194eba86d',
//     email: "Billy@email.com",
//     ...
//   }
// ]
```
