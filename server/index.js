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

// Get raw .json-filelist from ./form_templates
app.get("/templates/all/rawfilelist", (req, res) => {
  fs.promises.readdir(formTemplateDirectory)
    .then(filenames => {
      let fileNameArray = [];
      for (let filename of filenames) {
        if (path.extname(filename) == ".json") {
          fileNameArray.push(filename);
        } else console.log(`File ignored: ${filename}`)
      }
      console.log(fileNameArray);
      res.send(fileNameArray);
    })
    .catch(err => {
        console.log(err)
    })
});

// Get object with filelist and associated templateMetadata
app.get("/templates/all/filelistobject", (req, res) => {
  let pairObject = [];
  let fileNamesLength;

  fs.promises.readdir(formTemplateDirectory)
    .then(filenames => {
      for (let filename of filenames) {
        if (fileNamesLength === undefined) {
          fileNamesLength = filenames.length;
        }
        if (path.extname(filename) == ".json") {
          fs.promises.readFile(path.join(formTemplateDirectory, filename), 'utf-8')
            .then(openfile => {
              let parsedFile;
              try {
                parsedFile = JSON.parse(openfile);
              } catch (e) {
                fileNamesLength--;
                console.log("Error: JSON not parsed!", e)
                if (pairObject.length == fileNamesLength) {
                  res.send(pairObject)
                }
              }
              if (!parsedFile.hasOwnProperty("templateMetadata")) {
                fileNamesLength--;
                console.log("In catch block: " + fileNamesLength)
                if (pairObject.length == fileNamesLength) {
                  res.send(pairObject)
                }
                //console.log(parsedFile.templateMetadata)
              }
              else {
                if (!parsedFile.templateMetadata.hasOwnProperty("templateDisplayName")) {
                  fileNamesLength--;
                  console.log("In catch block: " + fileNamesLength)
                  if (pairObject.length == fileNamesLength) {
                    res.send(pairObject)
                  }
                }
                else {
                  //console.log(parsedFile.templateMetadata.templateDisplayName)
                  const newPair = {
                    "fname": filename,
                    "dname": parsedFile.templateMetadata.templateDisplayName
                  }
                  pairObject.push(newPair)
                  //console.log(JSON.stringify(newPair))
                  console.log("PairObject length: " + pairObject.length)
                  //console.log(JSON.stringify(pairObject))
                  console.log("FileNamesLength: " + fileNamesLength)
                  if (pairObject.length == fileNamesLength) {
                    res.send(pairObject)
                  }
                }
              }
            })
            .catch(err => {
              console.log(err)
            })
        } else {
          fileNamesLength--;
          console.log("In catch block: " + fileNamesLength)
          console.log(`File ignored: ${filename}`)
        }
      }
    })
    .then(pairObject => {
      setTimeout(() => {res.send(pairObject)}, 1000);
    })
    .catch(err => {
        console.log(err)
    })
});

// Get all data
app.get("/data/all", async (req, res) => {
  const allData = await pgClient.query("SELECT * FROM dataTable");
  //console.log(allData.rows)
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
