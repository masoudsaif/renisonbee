import React, { HTMLAttributes } from "react";
import "./Toolbar.css";

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {}

const Toolbar: React.FC<ToolbarProps> = ({ className, ...props }) => (
  <div className={`toolbar${className ? ` ${className}` : ""}`} {...props} />
);

export default Toolbar;
