import { createTheme, PaletteMode } from '@mui/material/styles';

// Custom gradients for both themes
const lightGradients = {
  primary: 'linear-gradient(135deg, #1976d2 0%,rgb(243, 244, 245) 100%)',
  secondary: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
  success: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
  info: 'linear-gradient(135deg, #0288d1 0%, #29b6f6 100%)',
  warning: 'linear-gradient(135deg, #ed6c02 0%, #ffa726 100%)',
  card: 'linear-gradient(to right bottom, #ffffff, #f9f9f9)',
  header: 'linear-gradient(120deg, #f5f5f5, #e0e0e0)',
};

const darkGradients = {
  primary: 'linear-gradient(135deg, #42a5f5 0%,rgb(0, 0, 0) 100%)',
  secondary: 'linear-gradient(135deg, #ab47bc 0%, #ce93d8 100%)',
  success: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)',
  info: 'linear-gradient(135deg, #0288d1 0%, #29b6f6 100%)',
  warning: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)',
  card: 'linear-gradient(to right bottom, #1e1e1e, #2d2d2d)',
  header: 'linear-gradient(120deg, #2d2d2d, #212121)',
};

// Extend the theme type to include custom gradients
declare module '@mui/material/styles' {
  interface Theme {
    gradients: {
      primary: string;
      secondary: string;
      success: string;
      info: string;
      warning: string;
      card: string;
      header: string;
    };
  }
  
  interface ThemeOptions {
    gradients?: {
      primary?: string;
      secondary?: string;
      success?: string;
      info?: string;
      warning?: string;
      card?: string;
      header?: string;
    };
  }
}

// Extend the Button variant props to include the gradient variant
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    gradient: true;
  }
}

// Extend the Card variant props
declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    gradient: true;
  }
}

// Extend the AppBar color options
declare module '@mui/material/AppBar' {
  interface AppBarPropsColorOverrides {
    gradient: true;
  }
}

export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light' 
      ? {
          // Light theme
          primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
          },
          secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
          },
        }
      : {
          // Dark theme
          primary: {
            main: '#90caf9',
            light: '#e3f2fd',
            dark: '#42a5f5',
          },
          secondary: {
            main: '#ce93d8',
            light: '#f3e5f5',
            dark: '#ab47bc',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
          },
        }),
  },
  gradients: mode === 'light' ? lightGradients : darkGradients,
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
      variants: [
        {
          props: { variant: 'gradient', color: 'primary' },
          style: {
            background: mode === 'light' ? lightGradients.primary : darkGradients.primary,
            color: '#fff',
            '&:hover': {
              opacity: 0.9,
              boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.1)',
            },
          },
        },
        {
          props: { variant: 'gradient', color: 'secondary' },
          style: {
            background: mode === 'light' ? lightGradients.secondary : darkGradients.secondary,
            color: '#fff',
            '&:hover': {
              opacity: 0.9,
              boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.1)',
            },
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' 
            ? '0 4px 6px rgba(0, 0, 0, 0.1)' 
            : '0 4px 6px rgba(0, 0, 0, 0.5)',
        },
      },
      variants: [
        {
          props: { variant: 'gradient' },
          style: {
            background: mode === 'light' ? lightGradients.card : darkGradients.card,
          },
        },
      ],
    },
    MuiAppBar: {
      variants: [
        {
          props: { color: 'gradient' },
          style: {
            background: mode === 'light' ? lightGradients.header : darkGradients.header,
            color: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : '#fff',
          },
        },
      ],
    },
  },
}); 