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
import "@ui5/webcomponents/dist/Avatar";

// Import CSS
import "./App.css";

function App() {
  return (
    <div className="App">
      <h4>Avatar Shapes</h4>
      <div className="snippet">
        <ui5-avatar image="../../../assets/images/avatars/woman_avatar_3.png" shape="Circle"></ui5-avatar>
        <ui5-avatar image="../../../assets/images/avatars/woman_avatar_4.png" shape="Square"></ui5-avatar>
      </div>
    </div>
  );
}

export default App;
