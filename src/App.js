// Import React Framework
import React from "react";

// Import UI5 libs
import "@ui5/webcomponents-fiori/dist/Assets";

// Import Tested Component
import "@ui5/webcomponents/dist/Avatar";

// Import CSS
import "./App.css";

function App() {
  return (
    <div className="App">
      <h4>Basic Avatar</h4>
      <div className="snippet">
        <ui5-avatar>
          <img src="../../../assets/images/avatars/man_avatar_1.png" alt="perf-tool" />
        </ui5-avatar>
        <ui5-avatar>
          <img src="../../../assets/images/avatars/woman_avatar_4.png" alt="perf-tool" />
        </ui5-avatar>
        <ui5-avatar shape="Square">
          <img src="../../../assets/images/avatars/woman_avatar_5.png" alt="perf-tool" />
        </ui5-avatar>
        <ui5-avatar shape="Square">
          <img src="../../../assets/images/avatars/man_avatar_3.png" alt="perf-tool" />
        </ui5-avatar>
      </div>
    </div>
  );
}

export default App;
