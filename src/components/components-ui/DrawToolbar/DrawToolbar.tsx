import Button from "../Button/Button";
import Toolbar from "../Toolbar/Toolbar";
import EventType from "../../../enum/event-type.enum";

export interface DrawToolbarProps {
  selectedMode: EventType;
  onSelectMode: (mode: EventType) => void;
}

const tools = [
  { mode: EventType.SELECT, label: "Select" },
  { mode: EventType.CREATE_LINE, label: "Line" },
  { mode: EventType.CREATE_RECTANGLE, label: "Rectangle" },
  { mode: EventType.CREATE_CIRCLE, label: "Circle" },
];

const DrawToolbar: React.FC<DrawToolbarProps> = ({
  selectedMode,
  onSelectMode,
}) => {
  return (
    <Toolbar>
      {tools.map((tool) => (
        <Button
          key={tool.mode}
          className={`${selectedMode === tool.mode ? "primary" : ""}`}
          onClick={() => onSelectMode(tool.mode)}
          title={tool.label}
        >
          {tool.label}
        </Button>
      ))}
    </Toolbar>
  );
};

export default DrawToolbar;
