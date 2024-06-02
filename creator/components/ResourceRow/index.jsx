import { DeleteRounded } from "@mui/icons-material";
import { Box, Button, TextField, Autocomplete, Stack, Divider, IconButton } from "@mui/material";
import { useRef, useState, useEffect } from "react";
import Image from "../Image";

export function ResourceRow({ onDelete, index, rowData }) {
    const [targetImageData, setTargetImageData] = useState(rowData.target);
    const [sourceImage, setSourceImage] = useState(rowData.source);

    useEffect(() => {
        rowData.source = sourceImage;
        rowData.target = targetImageData;
    }, [sourceImage, targetImageData]);

    const hiddenFilePicker = useRef(null);

    const uploadImageClick = (me) => {
        hiddenFilePicker.current.click();
    };

    const handleDelete = () => {
        onDelete(index);
    };

    const onImageChange = () => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setTargetImageData(reader.result);
        };
        reader.readAsDataURL(hiddenFilePicker.current.files[0]);
    };

    const onSourceChange = (event, value) => {
        setSourceImage(value);
    };

    return (
        // <Paper elevation={3}>
        <Box sx={{ m: 2, p: 1, display: "flex", gap: 2, alignItems: "center", border: "1px solid lightgray", borderRadius: 2, justifyContent: "space-evenly" }}>
            <IconButton aria-label="delete" color="error" onClick={handleDelete}> <DeleteRounded /> </IconButton>
            <Divider orientation="vertical" flexItem/>
            <Stack>
                {/* <img style={{ width: "200px", height: "200px", imageRendering: "pixelated" }} src={sourceImage ? `https://autosam.github.io/Tamaweb/${sourceImage}` : "static/images/default.jpg"}></img> */}
                <Image style={{ width:"200px", height:"200px", imageRendering: "pixelated" }} src={sourceImage ? `https://autosam.github.io/Tamaweb/${sourceImage}` : "static/images/default.jpg"}/>
                <Autocomplete
                    size="small"
                    disablePortal
                    // onChange={onSourceChange}
                    value={sourceImage}
                    onInputChange={onSourceChange}
                    options={[
                        { label: 'Sprites', disabled: true },
                        ...SPRITES,

                        { label: 'Babies', disabled: true },
                        ...PET_BABY_CHARACTERS,

                        { label: 'Teens', disabled: true },
                        ...PET_TEEN_CHARACTERS,

                        { label: 'Adults', disabled: true },
                        ...PET_ADULT_CHARACTERS,
                    ]}
                    getOptionDisabled={(option) => option.disabled}
                    sx={{ width: 400 }}
                    renderInput={(params) => <TextField {...params} label="Source" />} />
            </Stack>
            <Divider orientation="vertical" flexItem/>
            <Stack>
                <img style={{ width: "200px", height: "200px", imageRendering: "pixelated" }} src={targetImageData || "static/images/default.jpg"}></img>
                <Button size="large" variant="text" onClick={uploadImageClick}>Upload Target Image</Button>
            </Stack>

            <input ref={hiddenFilePicker} onChange={onImageChange} hidden type="file" />
        </Box>
        // </Paper>
    );
}
