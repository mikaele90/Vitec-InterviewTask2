import { useCallback, useState, useEffect } from "react";
import axios from "axios";
import "./MainComponent.css";

const MainComponent = () => {
  const [allData, setAllData] = useState([]);
  const [dataPoint, setDataPoint] = useState("");

  const getAllData = useCallback(async () => {
    // we will use nginx to redirect it to the proper URL
    const allData = await axios.get("/api/data/all");
    setAllData(allData.data.rows.map(row => row.data));
  }, []);

  const saveDataPoint = useCallback(async event => {
      event.preventDefault();

      await axios.post("/api/data", {
        dataPoint: dataPoint
      });

      setDataPoint("");
      getAllData();
    },
    [dataPoint, getAllData]
  );

  useEffect(() => {
    getAllData();
  }, []);

  return (
    <div>
      <button onClick={getAllData}>Get all data</button>
      <br />
      <span className="title">All data</span>
      <div className="allData">
        {allData.map(dataPoint => (
          <div className="dataRow">{dataPoint}</div>
        ))}
      </div>
      <form className="form" onSubmit={saveDataPoint}>
        <label>Enter your data: </label>
        <input
          value={dataPoint}
          onChange={event => {
            setDataPoint(event.target.value);
          }}
        />
        <button>Submit data</button>
      </form>
    </div>
  );
};

export default MainComponent;
