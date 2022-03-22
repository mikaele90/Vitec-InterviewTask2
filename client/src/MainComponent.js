import { useCallback, useState, useEffect } from "react";
import axios from "axios";
import "./MainComponent.css";

const MainComponent = () => {
  const [allData, setAllData] = useState([]);
  const [dataPoint, setDataPoint] = useState("");
  const [ownerTemplate, setOwnerTemplate] = useState("");

  const [rawFilelist, setRawFilelist] = useState([]);
  const [fileListObject, setFileListObject] = useState([]);

  const getAllData = useCallback(async () => {
    const allData = await axios.get("/api/data/all");
    //console.log("Logging inside getAllData:");
    //console.log(allData.data.rows);
    //setAllData(allData.data.rows.map(row => row.data));
    setAllData(allData.data.rows);
  }, []);

  const getRawFilelist = useCallback(async () => {
    const fetchedList = await axios.get("/api/templates/all/rawfilelist2");
    console.log(fetchedList);
    setRawFilelist(fetchedList);
  }, []);

  const getFilelistObject = useCallback(async () => {
    const fetchedList = await axios.get("/api/templates/all/filelistobject");
    console.log(fetchedList);
    setFileListObject(fetchedList);
  }, []);

  const saveDataPoint = useCallback(async event => {
      event.preventDefault();

      let jsonA = {};
      jsonA.data = dataPoint

      //console.log(jsonA);
      //console.log(ownerTemplate);

      await axios.post("/api/data", {
        dataPoint: jsonA,
        ownerTemplate: ownerTemplate
      });

      setDataPoint("");
      getAllData();
    },
    [dataPoint, getAllData]
  );

  useEffect(() => {
    getAllData();
    getRawFilelist();
    //getFilelistObject();
  }, []);

  return (
    <div>
      <button onClick={getAllData}>Get all data</button>
      <br />
      <span className="title">All data</span>

      <div className="allData">
        {console.log("Logging allData inside return:")}
        {console.log(allData)}
        {allData.map((dataRow) => (
          <div className="dataRow" key={dataRow.id}>{dataRow.data.data}</div>
        ))}
      </div>

      <form className="form" onSubmit={saveDataPoint}>
        <label>Enter your data: </label>
        <input
          value={dataPoint}
          onChange={event => {
            setDataPoint(event.target.value);
            setOwnerTemplate("test1");
          }}
        />
        <button>Submit data</button>
      </form>
    </div>
  );
};

export default MainComponent;
