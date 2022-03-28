import React, { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import './MainComponent.css';

import SelectFormTemplate from './SelectFormTemplate';
import DynamicTable from './DynamicTable';
import AddDataView from './AddDataView';
import EditDataView from './EditDataView';

const MainComponent = () => {
  
  const [allDataForForm, setAllDataForForm] = useState([]);

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
        console.log("Error during fetching all data for selected form.", err)
      })
  }, [selectedForm]);

  const getFormTemplateFile = useCallback(async () => {
    if (selectedForm === "") return
    await axios.get(`/api/templates/${selectedForm}`)
      .then(response => {
        setSelectedFormJSON(response.data)
        setOwnerTemplate(selectedForm)
      })
      .catch(err => {
        console.log("Error occured during fetch of template file.", err)
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
    let dataArray = [];
    for (let entry of columnTemplateData) {
      colUniqueNameKeyArray.push(entry.ColUniqueName)
    }
    for (let key of dataForId[0].data.data) {
      if (colUniqueNameKeyArray.indexOf(Object.keys(key)[0]) >= 0) {
        existingKeyArray.push(Object.keys(key)[0])
        dataArray.push(key);
      }
    }
    let idxCounter = 0;
    for (let key of colTD) {
      if (!existingKeyArray.includes(key.ColUniqueName)) {
        inputFieldsForEditing.data.push({[key.ColUniqueName]: ""})
      }
      else {
        inputFieldsForEditing.data.push({[key.ColUniqueName]: dataArray[idxCounter][key.ColUniqueName]})
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
    if (!showAddData && !showEditData) setShowAddData(true);
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

  return (
    <div>
      <br />
      <span className="title">Templates</span>
      <br /><br />

      <SelectFormTemplate handleChangeSelectedFormTemplate={handleChangeSelectedFormTemplate}/>

      <p>Selected file: { (selectedForm === "") ? "None" : selectedForm }</p>

      <DynamicTable 
        show={showTable} 
        templateMetadata={templateMetadata} 
        templateData={columnTemplateData} 
        templateDisplayData={columnDisplayData}
        currentFormData={allDataForForm} 
        editClick={handleEditDataButtonClicked} 
        deleteClick={handleDeleteDataButtonClicked}
      />

      <AddDataView 
        show={showAddData} 
        showTable={showTable} 
        showEditView={showEditData} 
        templateData={columnTemplateData} 
        addClick={handleAddDataClicked} 
        inputChange={handleChangedAddDataInput} 
        save={handleAddDataSave} 
        cancel={handleAddDataCancel}
      />

      <EditDataView 
        show={showEditData} 
        showAddView={showAddData}
        templateData={columnTemplateData} 
        inputFields={editDataInputFields} 
        inputChange={handleChangedEditDataInput} 
        save={handleEditDataSave} 
        cancel={handleEditDataCancel}
      />

      <br />
    </div>
  );
};

export default MainComponent;
