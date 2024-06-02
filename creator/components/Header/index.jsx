import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";

export default function Header({title = "Tamaweb Creator"}) {
    return (
        <AppBar position="static">
            <Toolbar variant="dense">
                <Typography variant="h6" color="inherit" component="div">
                    {title}
                </Typography>
            </Toolbar>
        </AppBar>
    )
}