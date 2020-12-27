// Import React Framework
import React from "react";

// Import UI5 libs
import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import "@ui5/webcomponents-base/dist/features/browsersupport/Edge.js";
import "@ui5/webcomponents-base/dist/thirdparty/webcomponents-sd-ce-pf.js";
import "@ui5/webcomponents/dist/Assets.js";
import "@ui5/webcomponents-icons/dist/Assets.js";

// Import Tested Component
import "@ui5/webcomponents/dist/Calendar";

// Import CSS
import "./App.css";

function App() {
  return (
    <div className="App">
      <h3>Calendar with selection type Range</h3>
      <div className="snippet">
        <div className="datepicker-width">
          <ui5-calendar selection="Range"></ui5-calendar>
        </div>
      </div>
    </div>
  );
}

export default App;
