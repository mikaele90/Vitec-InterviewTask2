const keys = require("./keys");

// Express Application setup
const express = require("express");
//const bodyParser = require("body-parser");
const cors = require("cors");

const fs = require("fs");
const path = require("path");
const formTemplateDirectory = path.join(__dirname, "form_templates");

const app = express();
app.use(cors());
//app.use(bodyParser.json());
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// Postgres client setup
const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

pgClient.on("connect", client => {
  client
    .query("CREATE TABLE IF NOT EXISTS dataTable (id SERIAL PRIMARY KEY, belongs_to_template VARCHAR, data JSONB)")
    .catch(err => console.log("Problem with postgres on connect", err));
});

//Express route definitions
app.get("/", (req, res) => {
  res.send("Backend says hi!");
});

// Get raw filelist from ./form_templates
app.get("/templates/all/rawfilelist", (req, res) => {
  let rawFilenameList = {};
  fs.readdir(formTemplateDirectory, { withFileTypes: true }, (err, files) => {
    //console.log("\nCreating raw filelist from 'form_templates'-directory:");
    if (err) console.log("Error fetching raw filelist!", err);
    else {
      rawFilenameList = files;
      //console.log("writing rawFilenameList...")
      //console.log(rawFilenameList);
      res.send(rawFilenameList);
    }
  });
});

// TODO
// Get raw filelist from ./form_templates
app.get("/templates/all/rawfilelist2", (req, res) => {
  res.send(null);
});

// TODO
// Get object with filelist and associated templateMetadata
app.get("/templates/all/filelistobject", async (req, res) => {
  res.send(null);
});

// Get all data
app.get("/data/all", async (req, res) => {
  const allData = await pgClient.query("SELECT * FROM dataTable");
  console.log(allData.rows)
  res.send(allData);
});

// Post new data
app.post("/data", async (req, res) => {
  console.log("Logging:")
  console.log(req.body)
  console.log(req.body.dataPoint.data)
  console.log(req.body.ownerTemplate)

  if (!req.body.dataPoint.data) res.send({ working: false });
  console.log("Saving into db...")
  pgClient
    .query("INSERT INTO dataTable(data, belongs_to_template) VALUES($1, $2)", [req.body.dataPoint, req.body.ownerTemplate])
    .catch(err => console.log("Saving into db failed...", err));
  console.log("Data saved successfully!")
  res.send({ working: true });
});

app.listen(5000, err => {
  console.log("Listening");
});
