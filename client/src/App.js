import { Fragment } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import MainComponent from "./components/MainComponent";
import UploadPage from "./components/UploadPage";

function App() {
  return (
    <Router>
      <Fragment key="mainFragment">
        <header className="header">
          <div className="headerTopDiv">Vitec Interview Task App</div>
          <Link to="/">Templates</Link>
          <Link to="/upload">Upload</Link>
        </header>
        <div className="main">
          <Route exact path="/" component={MainComponent} />
          <Route path="/upload" component={UploadPage} />
        </div>
      </Fragment>
    </Router>
  );
}

export default App;
