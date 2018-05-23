# CS359B
1. to run locally: npm start to run the front-end. in app directory, do node app.js to run backend.
2. in app/app.js: where the mysql connection is created, make sure the permissions/params are for local, and not for server
3. in app/public/app.js: change var isLocal to True so that the path will be correct for queries to the database
