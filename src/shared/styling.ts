import {createTheme} from '@mui/material/styles'

export const theme = createTheme({
    palette: {
        primary: {
            main: '#0098a0',
        },
        secondary: {
            main: '#7e28ff',
        },

        text: {
            primary: '#334155'
        }
    },

    components: {
        MuiInputBase: {
            styleOverrides: {
                root: {
                    fontSize: '0.85rem',
                },
            },
        },
    }
})