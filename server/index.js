// DB Keys
const keys = require('./keys');

// Express Application setup
const express = require('express');
const cors = require('cors');

const fs = require('fs');
const path = require('path');
const formTemplateDirectory = path.join(__dirname, "form_templates");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Postgres client setup
const { Pool } = require('pg');
const { Console } = require('console');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

/**
 * Create table and create index using the hash function.
 * It's unlikely that the query optimizer uses the index unless there's a lot of data in the table.
 */
pgClient.on("connect", client => {
  client
    .query("CREATE TABLE IF NOT EXISTS dataTable (id SERIAL PRIMARY KEY, belongs_to_template VARCHAR, data JSONB)")
    //.then(result => console.log(result.command))
    .catch(err => console.log("Problem with postgres on connect during CREATE TABLE.", err));
  client
    .query("CREATE INDEX IF NOT EXISTS IDX_OwnerTemplate ON datatable USING hash (belongs_to_template)")
    //.then(result => console.log(result.command))
    .catch(err => console.log("Problem with postgres on connect during CREATE INDEX.", err))
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
      if (filenames.length === 0) res.send(pairObject)
      if (fileNamesLength === undefined) {
        fileNamesLength = filenames.length;
      }
      for (let filename of filenames) {
        if (path.extname(filename) == ".json") {
          fs.promises.readFile(path.join(formTemplateDirectory, filename), 'utf-8')
            .then(openfile => {
              let parsedFile;
              try {
                parsedFile = JSON.parse(openfile);
                //parsedFile.hasOwnProperty("templateMetadata")
                parsedFile.templateMetadata.hasOwnProperty("templateDisplayName")
              } catch (e) {
                fileNamesLength--;
                console.log(`Error: Problem during JSON-parsing of file: ${filename} || fileNamesLength: ${fileNamesLength} || `, e.message);
                if (pairObject.length == fileNamesLength) {
                  console.log("Sending from catch block...")
                  res.send(pairObject)
                }
                else return;
              }
              //console.log(parsedFile.templateMetadata.templateDisplayName)
              const newPair = {
                "fname": filename,
                "dname": parsedFile.templateMetadata.templateDisplayName
              }
              pairObject.push(newPair)
              console.log(`Adding newPair to pairObject: ${JSON.stringify(newPair)}`)
              console.log("PairObject length: " + pairObject.length)
              //console.log(JSON.stringify(pairObject))
              console.log("FileNamesLength: " + fileNamesLength)
              if (pairObject.length == fileNamesLength) {
                console.log("Sending from error-free block...")
                res.send(pairObject)
              }
            })
            .catch(err => {
              console.log(err)
            })
        } else {
          fileNamesLength--;
          console.log(`File ignored due to incorrect file-extension: ${filename} || fileNamesLength: ${fileNamesLength}`)
          if (pairObject.length == fileNamesLength) {
            console.log("Sending from file-ignored block...")
            res.send(pairObject)
          }
        }
      }
    })
    .catch(err => {
      res.send(pairObject);
      console.log(err);
    })
});

// Get form template JSON for one template
app.get("/templates/:fileName", (req, res) => {
  console.log(`Requesting file: ${req.params.fileName}`)
  fs.promises.readFile(path.join(formTemplateDirectory, req.params.fileName), 'utf-8')
    .then(file => {
      console.log(file)
      res.send(file)
    })
    .catch(err => {
      console.log("File not sent...", err)
    })
});

// Get all data: Not in use for now
/*app.get("/data/all", async (req, res) => {
  const allData = await pgClient.query("SELECT * FROM dataTable");
  //console.log(allData.rows)
  res.send(allData);
});*/

// Get all associated data for a specific form based on its file name
app.get("/formdata/get/:fileName", async(req, res) => {
  console.log(`Requesting data for file: ${req.params.fileName}`);
  await pgClient
    .query("SELECT * FROM dataTable WHERE belongs_to_template = $1", [req.params.fileName])
    .then(result => res.send(result))
    .catch(err => console.log(`Fetching data for ${req.params.fileName} failed. `, err))
});

// Post new data
app.post("/formdata/new", async (req, res) => {
  console.log("Logging req.body:")
  console.log(req.body)
  if (req.body.datas === undefined) res.send({ working: false });
  console.log("Saving into db...")
  await pgClient
    .query("INSERT INTO dataTable(belongs_to_template, data) VALUES($1, $2)", [req.body.ownerTemplate, req.body.datas])
    .then(result => res.send(result))
    .catch(err => console.log("Saving into db failed...", err));
});

// Update a data entry
app.put("/formdata/update/:id", async (req, res) => {
  console.log(`Requesting updating of data entry with id: ${req.params.id}, Logging request body:`);
  console.log(req.body)
  if (req.body.datas === undefined) res.send({ working: false });
  console.log("Saving edits...")
  await pgClient
    .query("UPDATE dataTable SET data = $1 WHERE id = $2", [req.body.datas.data, req.params.id])
    .then(result => res.send(result))
    .catch(err => console.log("Unable to update!", err))
});

// Delete a data entry
app.delete("/formdata/delete/:id", async (req, res) => {
  console.log(`Requesting deletion of data entry with id: ${req.params.id}`);
  await pgClient
    .query("DELETE FROM dataTable WHERE id = $1", [req.params.id])
    .then(result => res.send(result))
    .catch(err => console.log("Unable to delete! ", err))
});

// Listen to port
app.listen(5000, err => {
  console.log("Listening...");
});
