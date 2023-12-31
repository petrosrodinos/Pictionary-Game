import { FC } from "react";
import { Tooltip } from "react-tooltip";
import { useTranslation } from "react-i18next";
import "./style.scss";

interface CopableProps {
  value: string;
  children: any;
}

const Copable: FC<CopableProps> = ({ value, children }) => {
  const { t } = useTranslation();
  const handleClick = () => {
    navigator.clipboard.writeText(value);
  };
  return (
    <span className="copable-item" data-tooltip-id="copable-tooltip" onClick={handleClick}>
      {children}
      <Tooltip
        style={{ zIndex: "10" }}
        id="copable-tooltip"
        place="bottom"
        content={t("click-to-copy")}
      />
    </span>
  );
};

export default Copable;
