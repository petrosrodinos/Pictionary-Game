import { FC } from "react";
import Typography from "../Typography";
import "./style.scss";

interface DropdownProps {
  value?: string;
  style?: React.CSSProperties;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  error?: string;
  label: string;
}

const Dropdown: FC<DropdownProps> = ({
  style,
  className = "",
  onChange,
  error,
  options,
  value,
  label,
}) => {
  return (
    <div className={`dropdown ${className}`} style={style}>
      <select value={value} onChange={onChange} className="dropdownSelect">
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="dropdownOption">
            {option.label}
          </option>
        ))}
      </select>
      {error && <Typography className="input-error">{error}</Typography>}
    </div>
  );
};

export default Dropdown;
