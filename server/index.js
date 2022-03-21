const keys = require("./keys");

// Express Application setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
    .query("CREATE TABLE IF NOT EXISTS dataTable (id SERIAL PRIMARY KEY, data VARCHAR)")
    .catch(err => console.log("Problem with postgres on connect", err));
});

//Express route definitions
app.get("/", (req, res) => {
  res.send("Backend says hi!");
});

// get the values
app.get("/data/all", async (req, res) => {
  const allData = await pgClient.query("SELECT * FROM dataTable");
  console.log(allData.rows)
  res.send(allData);
});

// now the post -> insert value
app.post("/data", async (req, res) => {
  console.log("Logging:")
  console.log(req.body)

  if (!req.body.dataPoint) res.send({ working: false });
  pgClient.query("INSERT INTO dataTable(data) VALUES($1)", [req.body.dataPoint]);
  res.send({ working: true });
});

app.listen(5000, err => {
  console.log("Listening");
});
