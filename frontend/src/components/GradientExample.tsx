import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme as useMuiTheme,
} from "@mui/material";
import { useTheme } from "../theme/useTheme";

const GradientExample = () => {
  const { mode } = useTheme();
  const theme = useMuiTheme();

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gradient Theme Examples
      </Typography>

      <Grid container spacing={3} sx={{ my: 2 }}>
        <Grid item xs={12} md={6}>
          <Card variant="gradient" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Gradient Card
              </Typography>
              <Typography>
                This card uses the {mode} theme's card gradient background.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Gradient Buttons
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
                <Button variant="gradient" color="primary">
                  Primary Gradient
                </Button>
                <Button variant="gradient" color="secondary">
                  Secondary Gradient
                </Button>
                <Button variant="contained" color="primary">
                  Regular Primary
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ my: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Available Gradients
              </Typography>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
              >
                {Object.entries(theme.gradients).map(([name, gradient]) => (
                  <Box key={name}>
                    <Typography variant="subtitle1" gutterBottom>
                      {name}
                    </Typography>
                    <Box
                      sx={{
                        height: 60,
                        borderRadius: 1,
                        background: gradient,
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            name === "card" || name === "header"
                              ? mode === "light"
                                ? "text.primary"
                                : "text.primary"
                              : "#fff",
                        }}
                      >
                        {gradient}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GradientExample;
