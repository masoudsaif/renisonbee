import React from "react";

interface IfProps {
  condition: boolean | null | Object;
  children: React.ReactNode;
}

const If: React.FC<IfProps> = ({ condition, children }) => {
  return condition ? <>{children}</> : null;
};

export default If;
