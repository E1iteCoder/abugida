import React, { useState } from "react";
import CardGroup from "./cardgroup.jsx";
import sections from "../data/section";
import "../styles/dashboard/dashboard.css";

export default function ModuleChooser() {
  const groupSets = sections;
  const [selectedSet, setSelectedSet] = useState(null);

  return (
    <div className="module-chooser">
      <h1 className="Dash-header">
        {selectedSet ? selectedSet.name : "Dashboard"}
      </h1>

      <div className="group-selector">
        {groupSets.map((mod) => (
          <button
            key={mod.key}
            className={mod.key === selectedSet?.key ? "active" : ""}
            onClick={() => setSelectedSet(mod)}
            disabled={mod.key !== "letters"} // 👈 Only enable "letters"
          >
            {mod.name}
          </button>
        ))}
      </div>

      {selectedSet && (
        <CardGroup
          topicKey={selectedSet.key}
          labelUrl={selectedSet.labelUrl}
          sectionSizes={selectedSet.sectionSizes}
        />
      )}
    </div>
  );
}
