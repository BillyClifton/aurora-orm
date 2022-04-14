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
      }
    ],
  };


  //build model
  let users = DB.Model(table_schema);

  //create Table
  await users.createTable();

  //insert record
  await users.create({
    email: "DudeMan@email.com"
    password: hashfunction("12345")
  });

  //get record
  let response = users.get({
    where: {
      email: "DudeMan@email.com"
    }
  });

  //update record
  let response = await users.update({password: hashFunction("password")},{
    where: {
      email: "DudeMan@email.com"
    }
  })

  //delete record
  let response = await users.destroy({email: "DudeMan@email.com"});

  //drop table
  await users.dropTable();

```
