import { FC } from "react";
import "./style.scss";
//import Typography from "../Typography";

interface DatePickerProps {
  value?: string;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (e: React.ChangeEvent<HTMLDataElement>) => void;
  error?: string;
}

const DatePicker: FC<DatePickerProps> = ({
  className = "",
  style,
  error,
  onChange,
}) => {
  return (
    <div className={`datepicker ${className}`} style={style}>
      {/* <Typography variant="h1" className="datepickerTypo">Birtday:</Typography> */}
      <input className="dateInput" type="date" onChange={onChange}></input>
      {error && <p className="input-error">{error}</p>}
    </div>
  );
};

export default DatePicker;
