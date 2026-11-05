import { createTheme } from '@mui/material/styles';

/** 사랑은 유행 디자인 토큰 – 파스텔 오렌지(메인) + 파스텔 옐로(보조) */
export const COLORS = {
  orange: '#FFB38A',
  orangeDeep: '#F0875A',
  orangeSoft: '#FFE4D2',
  yellow: '#FFE58F',
  yellowSoft: '#FFF6D6',
  cream: '#FFF9F2',
  brown: '#5B3A29',
  brownSoft: '#8C6A58',
  pink: '#FF9E9E',
  shelf: '#E8B98A',
};

const theme = createTheme({
  palette: {
    primary: { main: COLORS.orangeDeep, light: COLORS.orange, contrastText: '#fff' },
    secondary: { main: COLORS.yellow, contrastText: COLORS.brown },
    background: { default: COLORS.cream, paper: '#FFFFFF' },
    text: { primary: COLORS.brown, secondary: COLORS.brownSoft },
    error: { main: '#E86A6A' },
  },
  shape: { borderRadius: 18 },
  typography: {
    fontFamily: "'Gowun Dodum', sans-serif",
    h1: { fontFamily: "'Jua', sans-serif" },
    h2: { fontFamily: "'Jua', sans-serif" },
    h3: { fontFamily: "'Jua', sans-serif" },
    h4: { fontFamily: "'Jua', sans-serif" },
    h5: { fontFamily: "'Jua', sans-serif" },
    h6: { fontFamily: "'Jua', sans-serif" },
    button: { fontFamily: "'Jua', sans-serif", textTransform: 'none', fontSize: '1rem' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 999, minHeight: 44, paddingInline: 20 } },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 999, fontWeight: 600 } } },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 22 } } },
    MuiTextField: { defaultProps: { fullWidth: true } },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 16, backgroundColor: '#fff' } },
    },
  },
});

export default theme;
