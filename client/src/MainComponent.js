import React, { useCallback, useState, useEffect, useRef } from "react";
import axios from "axios";
import "./MainComponent.css";

const MainComponent = () => {
  // Render counter for keeping renders in check
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current = renderCount.current + 1;
    console.log(`Render counter: ${renderCount.current}`)
  });



  const [allData, setAllData] = useState([]);
  const [allDataForForm, setAllDataForForm] = useState([]);

  const [fileListPairArray, setFileListPairArray] = useState([]);

  const [selectedForm, setSelectedForm] = useState("");
  const [selectedFormJSON, setSelectedFormJSON] = useState("");

  const [templateMetadata, setTemplateMetadata] = useState("");
  const [columnTemplateData, setColumnTemplateData] = useState("");
  const [columnDisplayData, setColumnDisplayData] = useState("");

  const [addDataInputFields, setAddDataInputFields] = useState();
  const [ownerTemplate, setOwnerTemplate] = useState("");

  const [showTable, setShowTable] = useState(false);
  const [showAddData, setShowAddData] = useState(false);
  const [showEditData, setShowEditData] = useState(false);

  const getAllData = useCallback(async () => {
    const allDataFetch = await axios.get("/api/data/all");
    console.log("Logging inside getAllData: ", allDataFetch);
    //console.log(allData.data.rows);
    //setAllData(allData.data.rows.map(row => row.data));
    setAllData(allDataFetch.data.rows);
  }, []);

  const getAllDataForForm = useCallback(async () => {
    if (selectedForm === "") return
    await axios.get(`/api/formdata/${selectedForm}`)
      .then(response => {
        console.log("getAllDataForForm res: ", response);
        setAllDataForForm(response.data.rows);
      })
      .catch(err => {
        console.log("Error during fetching all data for selected form", err)
      })
  }, [selectedForm]);

  const getFilelistObject = useCallback(async () => {
    const fetchedFileListObject = await axios.get("/api/templates/all/filelistobject");
    console.log("getFilelistObject res: ", fetchedFileListObject.data);
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
        console.log("getFormTemplateFile res: ", response)
        setSelectedFormJSON(response.data)
        setOwnerTemplate(selectedForm)
      })
      .catch(err => {
        console.log("Error occured during fetch. ", err)
      })
  }, [selectedForm]);

  const handleSelectedFormJSONChanged = useCallback(() => {
    console.log("selectedFormJSON changed. ", selectedFormJSON)
    if (selectedFormJSON !== "") {
      setTemplateMetadata(selectedFormJSON.templateMetadata);
      setColumnTemplateData(selectedFormJSON.templateColumnData);
      setColumnDisplayData(selectedFormJSON.templateDisplayData);
      setShowTable(true);
    }
  }, [selectedFormJSON])

  const handleCreateInputFields = useCallback(() => {
    if (selectedFormJSON === "") return
    const colTD = selectedFormJSON.templateColumnData;
    console.log("Creating input fields from ", colTD);
    let inputFields = { ownerTemplate: ownerTemplate, data: [] };
    for (let key of colTD) {
      inputFields.data.push({[key.ColUniqueName]: ""})
    }
    console.log(`Created prototype for input states`, inputFields)
    setAddDataInputFields(inputFields);
  }, [selectedFormJSON, ownerTemplate]);

  const handleChangeSelectedFormTemplate = (event) => {
    event.preventDefault();
    const selectedFormFileName = event.target.value;
    setSelectedForm(selectedFormFileName)
    console.log("Form template changed to: " + selectedFormFileName)
  };

  const handleChangedAddDataInput = (event, index) => {
    event.preventDefault();
    console.log(`input changed at ${index}, target.value: ` , event.target.value)
    console.log(`input changed at ${index}, target.name: `, event.target.name)
    let workingData = [...addDataInputFields.data];
    workingData[index][event.target.name] = event.target.value;
    console.log("workingData: ", workingData)
    let obj = {"ownerTemplate": ownerTemplate, "data": workingData}
    setAddDataInputFields(obj)
    console.log("addDataInputFields: ", addDataInputFields)
  };

  const handleAddDataClicked = (event) => {
    event.preventDefault();
    handleCreateInputFields();
    if (!showAddData) setShowAddData(true);
  };

  const handleAddDataSave = useCallback(async (event) => {
    event.preventDefault();
    console.log("Saving... ", addDataInputFields)
    let jsonWrapper = {}
    jsonWrapper.data = addDataInputFields.data
    await axios.post("/api/data", {
      ownerTemplate: addDataInputFields.ownerTemplate,
      datas: jsonWrapper
    });
    if (showAddData) setShowAddData(false)
  }, [addDataInputFields, showAddData]);

  const handleAddDataCancel = (event) => {
    event.preventDefault();
    console.log("cancel clicked");
    handleCreateInputFields();
    if (showAddData) setShowAddData(false);
  };

  useEffect(() => {
    getAllData();
  }, [getAllData]);

  useEffect(() => {
    getFilelistObject();
  }, [getFilelistObject]);

  useEffect(() => {
    getFormTemplateFile();
  }, [getFormTemplateFile]);

  useEffect(() => {
    handleSelectedFormJSONChanged();
  }, [handleSelectedFormJSONChanged]);

  useEffect(() => {
    handleCreateInputFields();
  }, [handleCreateInputFields])

  useEffect(() => {
    getAllDataForForm();
  }, [getAllDataForForm])

  const tableView = () => {
    if (showTable) {
      //console.log(`JSON Metadata: `, templateMetadata)
      //console.log(`JSON ColumnData: `, columnTemplateData);
      //console.log(`JSON DisplayData: `, columnDisplayData);

      const thGen = () => {
        return columnTemplateData.map((row) => {
          return <th key={row.ColUniqueName}>{row.ColStandaloneDisplayName}</th>
        })
      }

      const trGen = () => {
        return allDataForForm.map((row, index) => {
          return <tr key={index}>{tdGen(row.data.data)}</tr>
        })
      }

      const tdGen = (dataArray) => {
        console.log(dataArray)
        return dataArray.map((dataPair, idx) => {
          console.log(dataPair, idx)
          console.log(dataPair[Object.keys(dataPair)[0]])
          return <td key={Object.keys(dataPair)[0]}>{dataPair[Object.keys(dataPair)[0]]}</td>
        })
      }

      return (
        <div name="div-table_view">
          <table name="dynamic-table" id={templateMetadata.templateDisplayName} key={templateMetadata.templateUniqueName}>
            <thead>
              <tr>{thGen()}</tr>
            </thead>
            <tbody>
              {trGen()}
            </tbody>
          </table>
        </div>
      );
    }
    else return <div><p>Select a form template to work with...</p></div>
  }

  const addDataCreateInputFields = () => {
    console.log(`JSON Metadata: `, templateMetadata)
    console.log(`JSON ColumnData: `, columnTemplateData);
    console.log(`JSON DisplayData: `, columnDisplayData);
    console.log(`addDataInputFields: `, addDataInputFields)
    console.log(`addDataInputFields.data: `, addDataInputFields.data)
    return (
        columnTemplateData.map((colRow, index) => {
          return (
            <React.Fragment key={`fragmentFor${colRow.ColUniqueName}`}>
              <br />
              <label htmlFor={colRow.ColUniqueName} key={`labelFor${colRow.ColUniqueName}`}>{`${colRow.ColStandaloneDisplayName}: `}</label>
              <input 
                name={colRow.ColUniqueName} 
                id={colRow.ColUniqueName} 
                key={index}
                onChange={event => handleChangedAddDataInput(event, index)}
              />
            </React.Fragment>
          );
        })
    );
  }

  const addDataView = () => {
    if (!showTable) return <div className="empty_div"></div>
    if (showAddData) {
      //console.log(addDataInputFields);
      return (
        <div name="div-add_data_open">
          {/*console.log(addDataInputFields)*/}
          <form className="form" onSubmit={handleAddDataSave}>
            <br/><br/>
            {addDataCreateInputFields()}
            <br/><br/>
            <button type="submit">Submit data</button>
            <button onClick={handleAddDataCancel}>Cancel</button>
          </form>
        </div>
      );
    }
    else {
      return <div name="div-add_data_closed"><br/><button name="button-add_data" onClick={handleAddDataClicked}>Add data</button><br/></div>
    }
  }

  return (
    <div>
      <br />
      <span className="title">Template Editor</span>
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
      <p>{ /*JSON.stringify(selectedFormJSON)*/ }</p>
      {tableView()}
      {addDataView()}
    </div>
  );
};

export default MainComponent;


