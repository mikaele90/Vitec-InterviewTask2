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

  const [showTable, setShowTable] = useState(false)

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
    await axios.get(`/api/templates/${selectedForm}`)
      .then(response => {
        console.log(response)
        setSelectedFormJSON(response.data)
      })
      .then(response => {
        //console.log(selectedFormJSON)
      })
      .catch(err => {
        console.log("Error occured during fetch. ", err)
      })
  }, [selectedForm]);

  const handleChangeSelectedFormTemplate = (event) => {
    event.preventDefault();
    const selectedFormFileName = event.target.value;
    setSelectedForm(selectedFormFileName)
    console.log("Form template changed to: " + selectedFormFileName)
    console.log("Form template changed to: " + selectedForm)
  };

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
  }, [getFormTemplateFile])

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
      </form>
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
      <p>{ selectedForm }</p>
      <p>{ JSON.stringify(selectedFormJSON) }</p>
    </div>
  );
};

export default MainComponent;
