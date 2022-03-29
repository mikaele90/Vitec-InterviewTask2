import { Fragment } from "react";
import './EditDataView.css';

import convertType from './component_functions/ConvertInputType';

const EditDataView = ({ show, showAddView, templateData, inputFields, inputChange, save, cancel }) => {

  const inputFieldProvider = (templateDataRow, index) => {
    const uniqueName = templateDataRow.ColUniqueName;
    const printName = templateDataRow.ColStandaloneDisplayName;
    const dt = templateDataRow.ColDataType;
    switch (dt) {
      case 'TEXT':
      case 'NUMBER':
      case 'DATE_DMY':
        return (
          <Fragment key={`fragmentFor${uniqueName}`}>
            <br />
            <label htmlFor={uniqueName} key={`labelFor${uniqueName}`}>{`${printName}: `}</label>
            <input 
              name={uniqueName}
              id={uniqueName} 
              key={uniqueName}
              type={convertType(dt)}
              value={inputFields.data[index][0][templateDataRow.ColUniqueName]}
              onChange={event => inputChange(event, index)}
            />
          </Fragment>
        );
      case 'BOOLEAN':
        return (
          <Fragment key={`fragmentFor${uniqueName}`}>
            <br />
            <label htmlFor={uniqueName} key={`labelFor${uniqueName}`}>{`${printName}: `}</label>
            <input 
              name={uniqueName}
              id={uniqueName} 
              key={uniqueName}
              type="checkbox"
              checked={inputFields.data[index][0][templateDataRow.ColUniqueName]}
              onChange={event => inputChange(event, index)}
            />
          </Fragment>
        );
      case 'PREDEFINED_CHOICE':
        return (
          <Fragment key={`fragmentFor${uniqueName}`}>
            <br />
            <label htmlFor={uniqueName} key={`labelFor${uniqueName}`}>{`${printName}: `}</label>
            <select name={uniqueName} defaultValue={"Select department..."} onChange={event => inputChange(event, index)}>
              <option value={inputFields.data[index][0][templateDataRow.ColUniqueName]} >{inputFields.data[index][0][templateDataRow.ColUniqueName]}</option>
              {templateDataRow.ColPredefinedChoiceValues.map((entry) => (
                <option value={entry} key={entry}>{entry}</option>
              ))}
            </select>
          </Fragment>
        );
      default:
        return (
          <Fragment key={`Undetermined-At-Index-${index}`}>
            <p name="p-error_input_type">Unable to determine input type.</p>
          </Fragment>
        );
    }
  }

  const editDataCreateEditFields = () => {
    return (
      templateData.map((templateDataRow, index) => {
        return inputFieldProvider(templateDataRow, index)
      })
    );
  }
  
  if (!show || showAddView) {
    return null;
  } 
  else if (show && !showAddView) {
    return (
      <div name="div-edit_data_open">
        <br/><br/>
        <form className="form" name="form-edit_data" onSubmit={event => save(event)}>
          {editDataCreateEditFields()}
          <br/><br/>
          <button type="submit">Save edited data</button>
          <button onClick={cancel}>Cancel</button>
        </form>
      </div>
    );
  }
  else {
    return null;
  }
}

export default EditDataView;
