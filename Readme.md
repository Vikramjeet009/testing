use koa-body which provides support for multipart, urlencoded, and json request bodies. Provides the same functionality as Express's bodyParser - multer.

# PRISMA

onDelete: Cascade - Deleting a referenced record will trigger the deletion of referencing record.

@@id([authorId, postId], name: "authorPostId") -
Using the @@id you indicated to prisma that the NewTable had a primary key composed by this two fields,

We've also passed it an optional name parameter to name the newly created field

# ERROR

Error: P1000: Authentication failed against database server at `localhost`, the provided database credentials for `postgres` are not valid.
Please make sure to provide valid database credentials for the database server at `localhost`.

Solution: sudo systemctl start postgresql.service
