import { Fragment } from "react";
import "./App.css";
import { BrowserRouter as Router, Route } from "react-router-dom";
import MainComponent from "./components/MainComponent";
import UploadPage from "./components/UploadPage";
import Header from "./components/Header"

function App() {
  return (
    <Router>
      <Fragment key="mainFragment">
        <Header />
        <div className="main">
          <Route exact path="/" component={MainComponent} />
          <Route path="/upload" component={UploadPage} />
        </div>
      </Fragment>
    </Router>
  );
}

export default App;
