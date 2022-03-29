import { Fragment } from "react";
import './AddDataView.css';

import convertType from './component_functions/ConvertInputType';

const AddDataView = ( { show, showTable, showEditView, templateData, addClick, inputChange, save, cancel } ) => {

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
              defaultChecked={false}
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
              <option value="Select department..." disabled hidden>Select department...</option>
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

  const addDataCreateInputFields = () => {
    return (
        templateData.map((templateDataRow, index) => {
          return inputFieldProvider(templateDataRow, index)
        })
    );
  }

  if (!showTable) {
    return null;
  } 
  if (!showEditView && !show) {
    return (
      <div name="div-add_data_closed">
        <br/>
        <button name="button-add_data" onClick={addClick}>
          Add data
        </button>
        <br/>
      </div>
    );
  }
  else if (show && !showEditView) {
    return (
      <div name="div-add_data_open">
        <form className="form" onSubmit={save}>
          <br/><br/>
          {addDataCreateInputFields()}
          <br/><br/>
          <button type="submit">Submit data</button>
          <button onClick={cancel}>Cancel</button>
        </form>
      </div>
    );
  }
  else {
    return null;
  }

}

export default AddDataView;
