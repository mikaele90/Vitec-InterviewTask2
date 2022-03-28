import { Fragment } from "react";
import './EditDataView.css';

const EditDataView = ({ show, showAddView, templateData, inputFields, inputChange, save, cancel }) => {

  const editDataCreateEditFields = () => {
    return (
      templateData.map((row, index) => {
        return (
          <Fragment key={`fragmentFor${row.ColUniqueName}`}>
            <br />
            <label htmlFor={row.ColUniqueName} key={`labelFor${row.ColUniqueName}`}>{`${row.ColStandaloneDisplayName}: `}</label>
            <input 
              name={row.ColUniqueName} 
              id={row.ColUniqueName} 
              key={row.ColUniqueName}
              value={inputFields.data[index][row.ColUniqueName]}
              onChange={event => inputChange(event, index)}
            />
          </Fragment>
        );
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
