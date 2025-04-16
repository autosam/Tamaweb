import { DeleteRounded } from "@mui/icons-material";
import { Box, Button, TextField, Autocomplete, Stack, Divider, IconButton, Typography } from "@mui/material";
import { useRef, useState, useEffect } from "react";
import Image from "../Image";
import { getImageDataSize } from "../../utils";
import { filesize } from "filesize";

export function ResourceRow({ onDelete, index, rowData }) {
    const [targetImageData, setTargetImageData] = useState(rowData.target);
    const [targetImageSize, setTargetImageSize] = useState(0);
    const [sourceImage, setSourceImage] = useState(rowData.source);
    const [imageMismatch, setImageMismatch] = useState(false);

    useEffect(() => {
        rowData.source = sourceImage;
        rowData.target = targetImageData;
        setTargetImageSize(getImageDataSize(targetImageData, true))

        console.log({target: targetImageRef.current, source: sourceImageRef.current});
    }, [sourceImage, targetImageData]);

    const hiddenFilePicker = useRef(null);
    const targetImageRef = useRef(null), sourceImageRef = useRef(null);

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

    const fileSize = filesize(targetImageSize);
    const isMB = fileSize.includes('MB');

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

                        { label: 'Children', disabled: true },
                        ...PET_CHILD_CHARACTERS,

                        { label: 'Teens', disabled: true },
                        ...PET_TEEN_CHARACTERS,

                        { label: 'Adults', disabled: true },
                        ...PET_ADULT_CHARACTERS,

                        { label: 'Elders', disabled: true },
                        ...PET_ELDER_CHARACTERS,
                    ]}
                    getOptionDisabled={(option) => option.disabled}
                    sx={{ width: 400 }}
                    renderInput={(params) => <TextField {...params} label="Source" />} />
            </Stack>
            <Divider orientation="vertical" flexItem/>
            <Stack>
                <img ref={targetImageRef} style={{ width: "200px", height: "200px", imageRendering: "pixelated" }} src={targetImageData || "static/images/default.jpg"}></img>
                <Button size="large" variant="text" onClick={uploadImageClick}>Upload Target Image</Button>
                <Typography fontSize={10} px={1} bgcolor={isMB ? "darkred" : "white"} position={"absolute"}>
                    {fileSize}
                    {Boolean(targetImageRef.current) && ` (${targetImageRef.current?.naturalWidth}x${targetImageRef.current?.naturalHeight})`}
                </Typography>
            </Stack>

            <input ref={hiddenFilePicker} onChange={onImageChange} hidden type="file" />
        </Box>
        // </Paper>
    );
}
