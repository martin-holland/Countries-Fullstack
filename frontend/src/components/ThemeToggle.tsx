import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "../theme/useTheme";

const ThemeToggle = () => {
  const { mode, toggleColorMode } = useTheme();

  return (
    <IconButton
      onClick={toggleColorMode}
      color="inherit"
      aria-label="toggle theme"
      sx={{ ml: 1 }}
    >
      {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};

export default ThemeToggle;
