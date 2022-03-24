import { useCallback, useState, useEffect, useRef } from "react";
import axios from "axios";
import "./MainComponent.css";

const MainComponent = () => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current = renderCount.current + 1;
    console.log(`Render counter: ${renderCount.current}`)
  });

  const [allData, setAllData] = useState([]);
  const [dataPoint, setDataPoint] = useState("");
  const [ownerTemplate, setOwnerTemplate] = useState("");

  const [rawFileNameArray, setRawFileNameArray] = useState([]);
  const [fileListPairArray, setFileListPairArray] = useState([]);

  const [selectedForm, setSelectedForm] = useState("")
  const [selectedFormJSON, setSelectedFormJSON] = useState("")

  const [showTable, setShowTable] = useState(false);
  const [showAddData, setShowAddData] = useState(false);
  const [showEditData, setShowEditData] = useState(false);

  const getAllData = useCallback(async () => {
    const allData = await axios.get("/api/data/all");
    //console.log("Logging inside getAllData:");
    //console.log(allData.data.rows);
    //setAllData(allData.data.rows.map(row => row.data));
    setAllData(allData.data.rows);
  }, []);

  const getRawFileNames = useCallback(async () => {
    const fetchedRawFileNamesObject = await axios.get("/api/templates/all/rawfilelist");
    //console.log(fetchedRawFileNamesObject.data);
    setRawFileNameArray(fetchedRawFileNamesObject.data);
  }, []);

  const getFilelistObject = useCallback(async () => {
    const fetchedFileListObject = await axios.get("/api/templates/all/filelistobject");
    console.log(fetchedFileListObject.data);
    let sortedFileListObject = fetchedFileListObject.data.sort((a, b) => {
      let displayNameA = a.dname.toLowerCase();
      let displayNameB = b.dname.toLowerCase();
      if (displayNameA < displayNameB) {
          return -1;
      }
      if (displayNameA > displayNameB) {
          return 1;
      }
      else return 0;
    });
    setFileListPairArray(sortedFileListObject);
  }, []);

  const getFormTemplateFile = useCallback(async () => {
    if (selectedForm === "") return
    await axios.get(`/api/templates/${selectedForm}`)
      .then(response => {
        console.log(response)
        setSelectedFormJSON(response.data)
      })
      .catch(err => {
        console.log("Error occured during fetch. ", err)
      })
  }, [selectedForm]);

  const handleSelectedFormJSONChanged = useCallback(() => {
    console.log("selectedFormJSON changed. ", selectedFormJSON)
    if (selectedFormJSON !== "") setShowTable(true);
  }, [selectedFormJSON])

  const handleChangeSelectedFormTemplate = (event) => {
    event.preventDefault();
    const selectedFormFileName = event.target.value;
    setSelectedForm(selectedFormFileName)
    console.log("Form template changed to: " + selectedFormFileName)
  };

  const handleAddDataClicked = (event) => {
    event.preventDefault();
    if (!showAddData) setShowAddData(true);
  }

  const handleAddDataSave = (event) => {
    event.preventDefault();
    console.log("save clicked");
    if (showAddData) setShowAddData(false);
  }

  const handleAddDataCancel = (event) => {
    event.preventDefault();
    console.log("cancel clicked")
    if (showAddData) setShowAddData(false);
  }

  const saveDataPoint = useCallback(async event => {
      event.preventDefault();

      let jsonA = {};
      jsonA.data = dataPoint

      //console.log(jsonA);
      //console.log(ownerTemplate);

      await axios.post("/api/data", {
        dataPoint: jsonA,
        ownerTemplate: ownerTemplate
      });

      setDataPoint("");
      getAllData();
  }, [dataPoint, ownerTemplate, getAllData]);

  useEffect(() => {
    getAllData();
  }, [getAllData]);

  useEffect(() => {
    getRawFileNames();
  }, [getRawFileNames]);

  useEffect(() => {
    getFilelistObject();
  }, [getFilelistObject]);

  useEffect(() => {
    getFormTemplateFile();
  }, [getFormTemplateFile]);

  useEffect(() => {
    handleSelectedFormJSONChanged();
  }, [handleSelectedFormJSONChanged]);

  const tableView = () => {
    if (showTable) {
      const metadata = selectedFormJSON.templateMetadata;
      console.log(`JSON Metadata: `, metadata)
      const columnData = selectedFormJSON.templateColumnData;
      console.log(`JSON ColumnData: `, columnData);
      const displayData = selectedFormJSON.templateDisplayData;
      console.log(`JSON DisplayData: `, displayData);
      const thGen = () => {
        return columnData.map((row)=>{
          return <th key={row.ColUniqueName}>{row.ColStandaloneDisplayName}</th>
        })
      }
      const tdGen = () => {

      }
      return (
        <div name="div-table_view">
          <table name="dynamic-table" id={metadata.templateDisplayName} key={metadata.templateUniqueName}>
            <thead>
            <tr>{thGen()}</tr>
            </thead>
            <tbody>

            </tbody>
          </table>
        </div>
      );
    }
    else return <div><p>Select a form template to work with...</p></div>
  }

  const addDataView = () => {
    if (!showTable) return <div className="empty_div"></div>
    if (showAddData) {
      return (
        <div name="div-add_data_open">
          <form className="form" onSubmit={saveDataPoint}>
            <label>Enter your data: </label>
            <input
              value={dataPoint}
              onChange={event => {
                setDataPoint(event.target.value);
                setOwnerTemplate("test1");
              }}
            />
            <button>Submit data</button>
            <button onClick={handleAddDataCancel}>Cancel</button>
          </form>
        </div>
      );
    }
    else {
      return <div name="div-add_data_closed"><button name="button-add_data" onClick={handleAddDataClicked}>Add data</button></div>
    }
  }

  return (
    <div>
      <button onClick={getAllData}>Get all data</button>
      <br />
      <span className="title">All data</span>

      <div className="allData">
        {/*console.log("Logging allData inside return:")*/}
        {/*console.log(allData)*/}
        {allData.map((dataRow) => (
          <div className="dataRow" key={dataRow.id}>{dataRow.data.data}</div>
        ))}
      </div>

      
      <br />
      
      <br />
      <br />
      <form name="form-select_template">
        <select name="select-form_templates" defaultValue={"Select template..."} onChange={handleChangeSelectedFormTemplate}>
          {/*console.log(fileListPairArray)*/}
          <option value="Select template..." disabled hidden>Select template...</option>
          {fileListPairArray.map((dataRow) => (
            <option value={dataRow.fname} key={dataRow.fname}>{dataRow.dname}</option>
          ))}
        </select>
      </form>
      
      <p>Selected file: { (selectedForm === "") ? "None" : selectedForm }</p>
      <p>{ JSON.stringify(selectedFormJSON) }</p>
      {tableView()}
      {addDataView()}
    </div>
  );
};

export default MainComponent;
