import React, { useCallback, useState, useEffect, useRef } from "react";
import axios from "axios";
import "./MainComponent.css";

const MainComponent = () => {
  // Render counter for keeping renders in check
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current++;
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

  const [editDataInputFields, setEditDataInputFields] = useState();
  const [currentEditData, setCurrentEditData] = useState("");

  const [showTable, setShowTable] = useState(false);
  const [showAddData, setShowAddData] = useState(false);
  const [showEditData, setShowEditData] = useState(false);

  const getAllData = useCallback(async () => {
    const allDataFetch = await axios.get("/api/data/all");
    //console.log("Logging inside getAllData: ", allDataFetch);
    //console.log(allData.data.rows);
    //setAllData(allData.data.rows.map(row => row.data));
    setAllData(allDataFetch.data.rows);
  }, []);

  const getAllDataForForm = useCallback(async () => {
    if (selectedForm === "") return
    await axios.get(`/api/formdata/${selectedForm}`)
      .then(response => {
        //console.log("getAllDataForForm res: ", response);
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
        //console.log("getFormTemplateFile res: ", response)
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
      setShowAddData(false);
      setShowEditData(false);
    }
  }, [selectedFormJSON])

  const handleCreateInputFields = useCallback(() => {
    if (selectedFormJSON === "") return;
    const colTD = selectedFormJSON.templateColumnData;
    console.log("Creating input fields from ", colTD);
    let inputFields = { ownerTemplate: ownerTemplate, data: [] };
    for (let key of colTD) {
      inputFields.data.push({[key.ColUniqueName]: ""})
    }
    console.log(`Created prototype for input states`, inputFields)
    setAddDataInputFields(inputFields);
  }, [selectedFormJSON, ownerTemplate]);

  const handleCreateEditFields = useCallback((id) => {
    if (selectedFormJSON === "" || id === undefined) return;
    console.log("handleCreateEditFields with id", id)
    //console.log("columnTemplateData", columnTemplateData)
    //console.log("allDataForForm: ", allDataForForm)
    const dataForId = allDataForForm.filter(i => i.id === parseInt(id))
    //console.log("dataForId: ", dataForId[0].data.data)
    setCurrentEditData(dataForId[0])
    const colTD = selectedFormJSON.templateColumnData;
    let inputFieldsForEditing = { id: dataForId[0].id, ownerTemplate: dataForId[0].belongs_to_template, data: [] };
    let existingKeyArray = []
    for (let key of dataForId[0].data.data) {
      existingKeyArray.push(Object.keys(key)[0])
    }
    //console.log("existingKeyArray:", existingKeyArray)
    let idxCounter = 0;
    for (let key of colTD) {
      console.log(key.ColUniqueName)
      if (existingKeyArray.includes(key.ColUniqueName)) {
        inputFieldsForEditing.data.push({[key.ColUniqueName]: dataForId[0].data.data[idxCounter][key.ColUniqueName]})
        idxCounter++;
      }
      else {
        inputFieldsForEditing.data.push({[key.ColUniqueName]: ""})
      }
    }
    console.log("Prototype for editing fields:", inputFieldsForEditing);
    setEditDataInputFields(inputFieldsForEditing);
  }, [allDataForForm, selectedFormJSON]);

  const handleChangeSelectedFormTemplate = (event) => {
    event.preventDefault();
    const selectedFormFileName = event.target.value;
    setSelectedForm(selectedFormFileName)
    console.log("Form template changed to: " + selectedFormFileName)
  };

  const handleChangedAddDataInput = (event, index) => {
    event.preventDefault();
    //console.log(`input changed at ${index}, target.value: ` , event.target.value)
    //console.log(`input changed at ${index}, target.name: `, event.target.name)
    let workingData = [...addDataInputFields.data];
    workingData[index][event.target.name] = event.target.value;
    //console.log("workingData: ", workingData)
    let obj = {"ownerTemplate": ownerTemplate, "data": workingData}
    setAddDataInputFields(obj)
    //console.log("addDataInputFields: ", addDataInputFields)
  };

  const handleChangedEditDataInput = (event, index) => {
    event.preventDefault();
    let workingData = [...editDataInputFields.data];
    workingData[index][event.target.name] = event.target.value;
    console.log("workingData: ", workingData)
    let obj = { "data": workingData}
    setEditDataInputFields(obj)
  }

  const handleAddDataClicked = (event) => {
    event.preventDefault();
    handleCreateInputFields();
    if (!showAddData) setShowAddData(true);
  };

  const handleEditDataButtonClicked = (event) => {
    event.preventDefault();
    console.log("Edit clicked on ", event.target)
    handleCreateEditFields(event.target.value)
    if (!showAddData && !showEditData) setShowEditData(true);
  };

  const handleDeleteDataButtonClicked = (event) => {
    event.preventDefault();
    console.log("Delete clicked on ", event.target)
    const deleteId = event.target.value
    if (!showAddData && !showEditData) {
      const question = `Delete entry with id: ${deleteId}?`;
      const answer = window.confirm(question);
      if (answer) {
        handleDeleteConfirm(deleteId);
      }
      else {
        handleDeleteCancel();
      }
    }
    else {
      window.alert("Can not delete while adding or editing data.")
    }
  };

  const handleAddDataSave = useCallback(async (event) => {
    event.preventDefault();
    console.log("Saving new data... ", addDataInputFields)
    let jsonWrapper = {}
    jsonWrapper.data = addDataInputFields.data
    console.log(jsonWrapper)
    await axios.post("/api/data", {
      ownerTemplate: addDataInputFields.ownerTemplate,
      datas: jsonWrapper
    });
    if (showAddData) setShowAddData(false)
    getAllDataForForm();
  }, [addDataInputFields, showAddData, getAllDataForForm]);

  const handleEditDataSave = useCallback(async (event) => {
    event.preventDefault();
    console.log("Save edits...", editDataInputFields)
    //console.log("Get id from:", currentEditData)
    // Do stuff
    let jsonWrapper = {}
    jsonWrapper.data = editDataInputFields.data;
    //console.log(jsonWrapper);
    await axios.put(`/api/formdata/update/${currentEditData.id}`, { datas: jsonWrapper })
    if (showEditData) setShowEditData(false);
    getAllDataForForm();
  }, [showEditData, editDataInputFields, currentEditData, getAllDataForForm]);

  const handleDeleteConfirm = useCallback(async (deleteId) => {
    console.log(`Deletion of data with id of ${deleteId} confirmed...`);
    await axios.delete(`/api/formdata/delete/${deleteId}`)
      .then((response) => {
        console.log(response);
        getAllDataForForm();
      })
  }, [getAllDataForForm]);

  const handleAddDataCancel = (event) => {
    event.preventDefault();
    console.log("Adding new data cancelled");
    handleCreateInputFields();
    if (showAddData) setShowAddData(false);
  };

  const handleEditDataCancel = (event) => {
    event.preventDefault();
    console.log("Editing cancelled...");
    if (showEditData) setShowEditData(false);
  };

  const handleDeleteCancel = () => {
    console.log("Deletion cancelled...")
  }
  
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
      const cTDAll = columnTemplateData.map(entry => entry.ColUniqueName)
      //console.log(`JSON Metadata: `, templateMetadata)
      //console.log(`JSON ColumnData: `, columnTemplateData);
      //console.log(`JSON DisplayData: `, columnDisplayData);

      const thGen = () => {
        return columnTemplateData.map((row) => {
          return (
            <th key={row.ColUniqueName}>
              {row.ColStandaloneDisplayName}
            </th>
          );
        })
      }

      const thGenB = () => {
        return (
          <React.Fragment key="buttonHeaderKey">
            <th key="editButtonHeader">Edit</th>
            <th key="deleteButtonHeader">Delete</th>
          </React.Fragment>
        );
      }

      const trGen = (cTDAll) => {
        return allDataForForm.map((row, index) => {
          return (
            <tr key={index}>
              {tdGen(row.data.data, cTDAll)}
              {tdGenB(row.id)}
            </tr>
          );
        })
      }

      const tdGen = (dataArray, cTDAll) => {
        var indexCounter = 0;
        //console.log("dataArray:", dataArray)
        //console.log("columnTemplateData Array:", cTDAll)
        let keyArray = []
        for (let i = 0; i < dataArray.length; i++) {
          keyArray.push(Object.keys(dataArray[i])[0])
        }
        //console.log("objectKeyArray:", ccc)
        return cTDAll.map((tdKey, index) => {
          //console.log("tdKey, index, indexcounter", tdKey, index, indexCounter, (index-indexCounter))
          if (keyArray.includes(tdKey)) {
            //console.log("it exists:", tdKey)
            return (
              <td key={tdKey}>{dataArray[index-indexCounter][tdKey]}</td>
            );
          }
          else {
            //console.log("it does NOT exist:", tdKey)
            indexCounter++;
            return (
              <td key={tdKey}>NULL</td>
            );
          }
        })
      }

      const tdGenB = (id) => {
        return (
          <React.Fragment key="buttonCells">
            <td value={id} name="cell-edit_button" key="editButtonCell">
              <button 
                name="button-edit"
                value={id}
                onClick={handleEditDataButtonClicked}
              >
                  Edit
              </button>
            </td>
            <td value={id} name="cell-delete_button" key="deleteButtonCell">
              <button 
                name="button-delete"
                value={id}
                onClick={handleDeleteDataButtonClicked}
              >
                Delete
              </button>
            </td>
          </React.Fragment>
        );
      }

      return (
        <div name="div-table_view">
          <table name="dynamic-table" id={templateMetadata.templateDisplayName} key={templateMetadata.templateUniqueName}>
            <thead>
              <tr>
                {thGen()}
                {thGenB()}
              </tr>
            </thead>
            <tbody>
              {trGen(cTDAll)}
            </tbody>
          </table>
        </div>
      );
    }
    else return <div><p>Select a form template to work with...</p></div>
  }

  const addDataCreateInputFields = () => {
    //console.log(`JSON Metadata: `, templateMetadata)
    //console.log(`JSON ColumnData: `, columnTemplateData);
    //console.log(`JSON DisplayData: `, columnDisplayData);
    //console.log(`addDataInputFields: `, addDataInputFields)
    //console.log(`addDataInputFields.data: `, addDataInputFields.data)
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
    else if (!showEditData) {
      return (
        <div name="div-add_data_closed">
          <br/>
          <button name="button-add_data" onClick={handleAddDataClicked}>
            Add data
          </button>
          <br/>
        </div>
      );
    }
  }

  const editDataCreateEditFields = (id) => {
    //console.log("Creating edit fields")
    //console.log("currentEditData open: ", currentEditData.data)
    //console.log("editDataInputFields set: ", editDataInputFields)
    //console.log("columnTemplateData: ", columnTemplateData)
    return (
      columnTemplateData.map((row, index) => {
        return (
          <React.Fragment key={`fragmentFor${row.ColUniqueName}`}>
            <br />
            <label htmlFor={row.ColUniqueName} key={`labelFor${row.ColUniqueName}`}>{`${row.ColStandaloneDisplayName}: `}</label>
            {/*console.log(editDataInputFields.data[index])*/}
            {/*console.log(editDataInputFields.data[index][row.ColUniqueName])*/}
            <input 
              name={row.ColUniqueName} 
              id={row.ColUniqueName} 
              key={index}
              value={editDataInputFields.data[index][row.ColUniqueName]}
              onChange={event => handleChangedEditDataInput(event, index)}
            />
          </React.Fragment>
        );
      })
    );
  }

  const editDataView = (id) => {
    if (!showEditData) return <div className="empty_div"></div>
    if (showEditData) {
      console.log("Showing editDataView...")
      return (
        <div name="div-edit_data_open">
          <br/><br/>
          <form className="form" name="form-edit_data" onSubmit={event => handleEditDataSave(event)}>
            {editDataCreateEditFields(id)}
            <br/><br/>
            <button type="submit">Save edited data</button>
            <button onClick={handleEditDataCancel}>Cancel</button>
          </form>
        </div>
      );
    }
  }

  return (
    <div>
      <br />
      <span className="title">Templates</span>
      <br /><br />

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
      {editDataView()}
    </div>
  );
};

export default MainComponent;
