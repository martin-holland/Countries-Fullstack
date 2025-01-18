import LockIcon from "@mui/icons-material/Lock";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navigation = () => {
  const { user, signOut } = useAuth();

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          My App
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/test">
            Public Data
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/protected"
            startIcon={<LockIcon />}
          >
            Protected Data
          </Button>
          {user ? (
            <Button color="inherit" onClick={signOut}>
              Logout ({user.email})
            </Button>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
