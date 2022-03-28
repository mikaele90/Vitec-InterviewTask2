import React, { useCallback, useState, useEffect, useRef } from "react";
import axios from "axios";
import "./MainComponent.css";

export default function MainComponent() {
  // Render counter for keeping renders in check
  const renderCount = useRef(1);
  useEffect(() => {
    renderCount.current++;
    //console.log(`Render counter: ${renderCount.current}`)
  });

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

  const getAllDataForForm = useCallback(async () => {
    if (selectedForm === "") return
    await axios.get(`/api/formdata/${selectedForm}`)
      .then(response => {
        setAllDataForForm(response.data.rows);
      })
      .catch(err => {
        console.log("Error during fetching all data for selected form", err)
      })
  }, [selectedForm]);

  const getFilelistObject = useCallback(async () => {
    const fetchedFileListObject = await axios.get("/api/templates/all/filelistobject");
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
        setSelectedFormJSON(response.data)
        setOwnerTemplate(selectedForm)
      })
      .catch(err => {
        console.log("Error occured during fetch. ", err)
      })
  }, [selectedForm]);

  const handleSelectedFormJSONChanged = useCallback(() => {
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
    let inputFields = { ownerTemplate: ownerTemplate, data: [] };
    for (let key of colTD) {
      inputFields.data.push({[key.ColUniqueName]: ""})
    }
    setAddDataInputFields(inputFields);
  }, [selectedFormJSON, ownerTemplate]);

  const handleCreateEditFields = useCallback((id) => {
    if (selectedFormJSON === "" || id === undefined) return;
    const dataForId = allDataForForm.filter(i => i.id === parseInt(id))
    setCurrentEditData(dataForId[0])
    const colTD = selectedFormJSON.templateColumnData;
    let inputFieldsForEditing = { id: dataForId[0].id, ownerTemplate: dataForId[0].belongs_to_template, data: [] };
    let existingKeyArray = []
    let colUniqueNameKeyArray = []
    let abc = [];
    for (let entry of columnTemplateData) {
      colUniqueNameKeyArray.push(entry.ColUniqueName)
    }
    for (let key of dataForId[0].data.data) {
      if (colUniqueNameKeyArray.indexOf(Object.keys(key)[0]) >= 0) {
        existingKeyArray.push(Object.keys(key)[0])
        abc.push(key);
      }
    }
    let idxCounter = 0;
    for (let key of colTD) {
      if (!existingKeyArray.includes(key.ColUniqueName)) {
        inputFieldsForEditing.data.push({[key.ColUniqueName]: ""})
      }
      else {
        inputFieldsForEditing.data.push({[key.ColUniqueName]: abc[idxCounter][key.ColUniqueName]})
        idxCounter++;
      }
    }
    setEditDataInputFields(inputFieldsForEditing);
  }, [allDataForForm, columnTemplateData, selectedFormJSON]);

  const handleChangeSelectedFormTemplate = (event) => {
    event.preventDefault();
    const selectedFormFileName = event.target.value;
    setSelectedForm(selectedFormFileName)
  };

  const handleChangedAddDataInput = (event, index) => {
    event.preventDefault();
    let workingData = [...addDataInputFields.data];
    workingData[index][event.target.name] = event.target.value;
    let obj = {"ownerTemplate": ownerTemplate, "data": workingData}
    setAddDataInputFields(obj)
  };

  const handleChangedEditDataInput = (event, index) => {
    event.preventDefault();
    let workingData = [...editDataInputFields.data];
    workingData[index][event.target.name] = event.target.value;
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
    handleCreateEditFields(event.target.value)
    if (!showAddData && !showEditData) setShowEditData(true);
  };

  const handleDeleteDataButtonClicked = (event) => {
    event.preventDefault();
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
    let jsonWrapper = {}
    jsonWrapper.data = addDataInputFields.data
    await axios.post("/api/data", {
      ownerTemplate: addDataInputFields.ownerTemplate,
      datas: jsonWrapper
    });
    if (showAddData) setShowAddData(false)
    getAllDataForForm();
  }, [addDataInputFields, showAddData, getAllDataForForm]);

  const handleEditDataSave = useCallback(async (event) => {
    event.preventDefault();
    let jsonWrapper = {}
    jsonWrapper.data = editDataInputFields.data;
    await axios.put(`/api/formdata/update/${currentEditData.id}`, { datas: jsonWrapper })
    if (showEditData) setShowEditData(false);
    getAllDataForForm();
  }, [showEditData, editDataInputFields, currentEditData, getAllDataForForm]);

  const handleDeleteConfirm = useCallback(async (deleteId) => {
    await axios.delete(`/api/formdata/delete/${deleteId}`)
      .then((response) => {
        getAllDataForForm();
      })
  }, [getAllDataForForm]);

  const handleAddDataCancel = (event) => {
    event.preventDefault();
    handleCreateInputFields();
    if (showAddData) setShowAddData(false);
  };

  const handleEditDataCancel = (event) => {
    event.preventDefault();
    if (showEditData) setShowEditData(false);
  };

  const handleDeleteCancel = () => {
    // If something needs to be done
  }

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

      const trGen = (columnDataTableArray) => {
        return allDataForForm.map((row, index) => {
          return (
            <tr key={index}>
              {tdGenV3(row.data.data, columnDataTableArray)}
              {tdGenB(row.id)}
            </tr>
          );
        })
      }

      const tdGenV3 = (dataArray, columnDataTableArray) => {
        var indexCounter = 0;
        let keyArray = []
        let keyArrayB = []
        let leftOvers = []
        let extras = []
        for (let i = 0; i < dataArray.length; i++) {
          if (columnDataTableArray.includes(Object.keys(dataArray[i])[0])) {
            keyArray.push(dataArray[i])
            keyArrayB.push(Object.keys(dataArray[i])[0])
          }
          else {
            leftOvers.push(dataArray[i])
          }
        }

        return columnDataTableArray.map((entryKey, index) => {
          if (keyArrayB.indexOf(entryKey) >= 0) {
            return (
              <td key={entryKey}>{keyArray[keyArrayB.indexOf(entryKey)][entryKey]}</td>
            );
          }
          else {
            return (
              <td key={entryKey}></td>
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
      return (
        <div name="div-add_data_open">
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

  const editDataCreateEditFields = () => {
    return (
      columnTemplateData.map((row, index) => {
        return (
          <React.Fragment key={`fragmentFor${row.ColUniqueName}`}>
            <br />
            <label htmlFor={row.ColUniqueName} key={`labelFor${row.ColUniqueName}`}>{`${row.ColStandaloneDisplayName}: `}</label>
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
          <option value="Select template..." disabled hidden>Select template...</option>
          {fileListPairArray.map((dataRow) => (
            <option value={dataRow.fname} key={dataRow.fname}>{dataRow.dname}</option>
          ))}
        </select>
      </form>
      
      <p>Selected file: { (selectedForm === "") ? "None" : selectedForm }</p>
      {tableView()}
      {addDataView()}
      {editDataView()}
    </div>
  );
};
