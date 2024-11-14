import React, { HTMLAttributes } from "react";
import "./Button.css";

export interface ButtonsProps extends HTMLAttributes<HTMLButtonElement> {}

const Button: React.FC<ButtonsProps> = ({ className, ...props }) => (
  <button className={`button${className ? ` ${className}` : ""}`} {...props} />
);

export default Button;
