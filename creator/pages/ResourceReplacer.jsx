import { useRef, useState, useEffect } from "react";
import { AddRounded, DeleteRounded, SaveRounded, FilePresent, FileUploadRounded } from "@mui/icons-material";
import { Box, Input, Button, TextField, Typography, ButtonGroup, Paper, Stack, Container, Divider, Autocomplete } from "@mui/material";

function saveFile(data, fileName) {
    const element = document.createElement("a");
    const file = new Blob([data], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
}

function ResourceRow({ onDelete, index, rowData }) {
    const [targetImageData, setTargetImageData] = useState(rowData.target);
    const [sourceImage, setSourceImage] = useState(rowData.source);

    useEffect(() => {
        rowData.source = sourceImage;
        rowData.target = targetImageData;
    }, [sourceImage, targetImageData])

    const hiddenFilePicker = useRef(null);

    const uploadImageClick = (me) => {
        hiddenFilePicker.current.click();
    }

    const handleDelete = () => {
        onDelete(index);
    }

    const onImageChange = () => {
        // console.log(hiddenFilePicker.current.files[0].readAsDataURL());
        const reader = new FileReader();
        reader.onloadend = () => {
            setTargetImageData(reader.result);
        }
        reader.readAsDataURL(hiddenFilePicker.current.files[0]);
    }

    const onSourceChange = (event, value) => {
        setSourceImage(value)
    }

    return (
        // <Paper elevation={3}>
        <Box sx={{ m: 2, p: 1, display: "flex", gap: 2, alignItems: "center", border: "1px solid lightgray" }}>
            <Button color="error" onClick={handleDelete}> <DeleteRounded /> </Button>
            {/* <TextField onChange={onSourceChange} value={sourceImage} variant="outlined" label="Source" /> */}
            <Autocomplete
                disablePortal
                // onChange={onSourceChange}
                value={sourceImage}
                onInputChange={onSourceChange}
                options={[
                    {label: 'Sprites', disabled: true},
                    ...SPRITES,

                    {label: 'Babies', disabled: true},
                    ...PET_BABY_CHARACTERS,

                    {label: 'Teens', disabled: true},
                    ...PET_TEEN_CHARACTERS,

                    {label: 'Adults', disabled: true},
                    ...PET_ADULT_CHARACTERS,
                ]}
                getOptionDisabled={(option) => option.disabled}
                sx={{ width: 400 }}
                renderInput={(params) => <TextField {...params} label="Source" />}
            />
            <Button variant="outlined" onClick={uploadImageClick}>Upload Target Image</Button>
            <img style={{ width: "200px", height: "200px" }} src={targetImageData || "static/images/default.jpg"}></img>
            <input ref={hiddenFilePicker} onChange={onImageChange} hidden type="file" />
        </Box>
        // </Paper>
    )
}

export default function ResourceReplacer() {
    const [resourceRows, setResourceRows] = useState([{ source: '', target: '', id: Date.now(), }]);
    const [packageName, setPackageName] = useState('');
    const [packageDescription, setPackageDescription] = useState('');
    const [notValid, setNotValid] = useState(false);

    useEffect(() => {
        setNotValid(false);
    }, [packageName])

    const handleAddRow = () => {
        const newRow = {
            source: '', target: '', id: Date.now(),
        }

        setResourceRows([...resourceRows, newRow]);
    }
    const handleDeleteRow = (index) => {
        const newResourceRows = resourceRows.toSpliced(index, 1);
        setResourceRows(newResourceRows);
    }
    const handleSave = () => {
        if(!packageName) return setNotValid(true);

        const packageData = {
            name: packageName,
            description: packageDescription,
            replaced_resources: resourceRows.map(({ source, target }) => {
                return [source, target];
            })
        }

        saveFile(JSON.stringify(packageData), `${packageName}.rop`);
        console.log(packageData);
    }
    const handleLoad = async () => {
        const [fileHandle] = await showOpenFilePicker();
        const file = await fileHandle.getFile();
        const text = await file.text();
        try {
            const json = JSON.parse(text);
            setPackageName(json.name);
            setPackageDescription(json.description);
            setResourceRows( json.replaced_resources.map( ([source, target], index) => {
                return {
                    id: Date.now() + index,
                    source, 
                    target, 
                }
            }))
        } catch (e) {
            alert(`Error, ${e}`);
        }
    }

    return (

        <Stack spacing={2} m={"10px"}>
            <Typography variant="h5">Create Tamaweb Resource Override Package</Typography>

            <Divider/>

            <Stack spacing={1} sx={{ p: 1, border: "solid 1px lightgray" }}>
                <TextField error={notValid} value={packageName} onChange={(e) => setPackageName(e.target.value)} variant="outlined" label="Package Name" />
                <TextField value={packageDescription} onChange={(e) => setPackageDescription(e.target.value)} multiline variant="outlined" label="Description" />
            </Stack>

            <Box sx={{ display: "flex", gap: "5px" }}>

                <Button
                    variant="contained"
                    onClick={handleAddRow}
                >
                    <AddRounded /> Add Override
                </Button>

                <Button
                    variant="contained"
                    color="success"
                    onClick={handleSave}
                >
                    <SaveRounded /> Save
                </Button>

                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleLoad}
                >
                    <FileUploadRounded /> Load
                </Button>

            </Box>

            <Stack spacing={1} sx={{ p: 2, border: "1px solid lightgray" }}>
                {
                    resourceRows.length ? resourceRows.map((row, i) =>
                        <ResourceRow
                            key={row.id}
                            index={i}
                            rowData={row}
                            onDelete={handleDeleteRow}
                        />)
                        : <Typography color="neutral">No overrides</Typography>

                }
            </Stack>
        </Stack>
    )
}