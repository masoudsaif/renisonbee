import React, { useState } from "react";
import DrawPanel from "./DrawPanel/DrawPanel";
import PlanEventType from "./enum/event-type.enum";
import MeasurementUnit from "./enum/measurement-unit.enum";
import "./App.css";
import DrawToolbar from "./components/components-ui/DrawToolbar/DrawToolbar";

const App: React.FC = () => {
  const [mode, setMode] = useState(PlanEventType.CREATE_LINE);
  const [unit] = useState<MeasurementUnit>(MeasurementUnit.PIXELS);

  const handleSelectMode = (mode: PlanEventType) => setMode(mode);

  return (
    <div>
      <DrawToolbar selectedMode={mode} onSelectMode={handleSelectMode} />
      <DrawPanel mode={mode} unit={unit} />
    </div>
  );
};

export default App;
