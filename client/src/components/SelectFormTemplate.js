import { useState, useEffect, useCallback, Fragment } from 'react';
import axios from 'axios';
import './SelectFormTemplate.css';

const SelectFormTemplate = ( { handleChangeSelectedFormTemplate } ) => {

  const [fileListPairArray, setFileListPairArray] = useState([]);

  const getFileListObject = useCallback(async () => {
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

  useEffect(() => {
    getFileListObject();
  }, [getFileListObject]);

  return (
    <Fragment key="selectFormTemplateFragment">
      <form name="form-select_template">
        <select name="select-form_templates" defaultValue={"Select template..."} onChange={handleChangeSelectedFormTemplate}>
          <option value="Select template..." disabled hidden>Select template...</option>
          {fileListPairArray.map((dataRow) => (
            <option value={dataRow.fname} key={dataRow.fname}>{dataRow.dname}</option>
          ))}
        </select>
      </form>
    </Fragment>
  );
}

export default SelectFormTemplate;
