import { Box, CircularProgress } from "@mui/material";
import { Logo } from "./Logo";

export function Loader({ size = 'medium' }: { size?: string }) {
  let cpSize = "35px";
  switch (size) {
    case "small":
      cpSize = "30px";
      break;
    case "medium":
      cpSize = "35px";
      break;
    case "large":
      cpSize = "45px";
      break;
    default:
      cpSize = "35px";
      break;
  }
  return (
    <Box sx={{ display: 'flex', justifyContent: "center", alignItems: "center" }}>
      <CircularProgress color="warning" size={cpSize} />
      <div style={{ position: "absolute" }}>
        <Logo size={size} />
      </div>
    </Box>
  );
}
