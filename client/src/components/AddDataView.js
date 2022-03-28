import { Fragment } from "react";
import './AddDataView.css';

const AddDataView = ( { show, showTable, showEditView, templateData, addClick, inputChange, save, cancel } ) => {

  const addDataCreateInputFields = () => {
    return (
        templateData.map((colRow, index) => {
          return (
            <Fragment key={`fragmentFor${colRow.ColUniqueName}`}>
              <br />
              <label htmlFor={colRow.ColUniqueName} key={`labelFor${colRow.ColUniqueName}`}>{`${colRow.ColStandaloneDisplayName}: `}</label>
              <input 
                name={colRow.ColUniqueName} 
                id={colRow.ColUniqueName} 
                key={index}
                onChange={event => inputChange(event, index)}
              />
            </Fragment>
          );
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
