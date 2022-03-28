import { Fragment } from 'react';
import './DynamicTable.css';

const DynamicTable = ( { show, templateMetadata, templateData, templateDisplayData, currentFormData, editClick, deleteClick } ) => {

  if (show) {
    const uniqueColumnNamesArray = templateData.map(entry => entry.ColUniqueName)

    const thGen = () => {
      return templateData.map((row) => {
        return (
          <th key={row.ColUniqueName}>
            {row.ColStandaloneDisplayName}
          </th>
        );
      })
    }

    const thGenB = () => {
      return (
        <Fragment key="buttonHeaderKey">
          <th key="editButtonHeader">Edit</th>
          <th key="deleteButtonHeader">Delete</th>
        </Fragment>
      );
    }

    const trGen = (uniqueColumnNamesArray) => {
      return currentFormData.map((rowData) => {
        return (
          <tr key={rowData.id}>
            {tdGenV3(rowData.data.data, uniqueColumnNamesArray)}
            {tdGenB(rowData.id)}
          </tr>
        );
      })
    }

    const tdGenV3 = (dataArray, uniqueColumnNamesArray) => {
      let keyArray = []
      let keyArrayB = []
      for (let i = 0; i < dataArray.length; i++) {
        if (uniqueColumnNamesArray.includes(Object.keys(dataArray[i])[0])) {
          keyArray.push(dataArray[i])
          keyArrayB.push(Object.keys(dataArray[i])[0])
        }
      }

      return uniqueColumnNamesArray.map((entryKey) => {
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
        <Fragment key="buttonCells">
          <td value={id} name="cell-edit_button" key="editButtonCell">
            <button 
              name="button-edit"
              value={id}
              onClick={editClick}
            >
                Edit
            </button>
          </td>
          <td value={id} name="cell-delete_button" key="deleteButtonCell">
            <button 
              name="button-delete"
              value={id}
              onClick={deleteClick}
            >
              Delete
            </button>
          </td>
        </Fragment>
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
            {trGen(uniqueColumnNamesArray)}
          </tbody>
        </table>
      </div>
    );
  }
  else {
    return (
      <Fragment key="dynamicTableFragment">
        <p>Selects a template from the dropdown menu...</p>
      </Fragment>
    );
  }

  
}

export default DynamicTable;
