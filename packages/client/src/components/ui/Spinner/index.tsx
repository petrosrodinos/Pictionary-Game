import { CSSProperties, FC } from "react";
import { PacmanLoader } from "react-spinners";

interface SpinnerProps {
  loading: boolean;
  style?: CSSProperties;
}

const Spinner: FC<SpinnerProps> = ({ loading, style }) => {
  const override: CSSProperties = {
    margin: "0 auto",
  };
  return (
    <PacmanLoader
      color="#eac7c7"
      loading={loading}
      cssOverride={{ ...override, ...style }}
      size={40}
      aria-label="Loading Spinner"
      data-testid="loader"
    />
  );
};

export default Spinner;
