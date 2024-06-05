import { useState, useEffect } from "react";
import { AddRounded, SaveRounded, FileUploadRounded } from "@mui/icons-material";
import { Box, Button, TextField, Typography, Stack, Divider, Link } from "@mui/material";
import { ResourceRow } from "../components/ResourceRow";
import { saveFile } from "../utils";
import { uid } from "uid";

export default function ResourceReplacer() {
    const [resourceRows, setResourceRows] = useState([]); // [{ source: '', target: '', id: Date.now(), }]
    const [packageName, setPackageName] = useState('');
    const [packageDescription, setPackageDescription] = useState('');
    const [packageAuthor, setPackageAuthor] = useState('');
    const [packageId, setPackageId] = useState('');
    const [notValid, setNotValid] = useState(false);

    useEffect(() => {
        setNotValid(false);
        if (!packageId && packageName) setPackageId(uid(24));
    }, [packageName])

    const handleAddRow = () => {
        const newRow = {
            source: '', target: '', id: Date.now(),
        }

        setResourceRows([newRow, ...resourceRows]);
    }
    const handleDeleteRow = (index) => {
        const newResourceRows = resourceRows.toSpliced(index, 1);
        setResourceRows(newResourceRows);
    }
    const handleSave = () => {
        if (!packageName) return setNotValid(true);

        const packageData = {
            name: packageName,
            description: packageDescription,
            author: packageAuthor,
            id: packageId,
            replaced_resources: resourceRows.map(({ source, target }) => {
                return [source, target];
            })
        }

        saveFile(JSON.stringify(packageData), `${packageName}.rop`);
        console.log(packageData);
    }
    const handleLoad = async () => {
        // if (typeof showOpenFilePicker === "undefined") {
        //     return alert('You need to use a chromium based browser to able to use this web application');
        // }
        const [fileHandle] = await showOpenFilePicker();
        const file = await fileHandle.getFile();
        const text = await file.text();
        try {
            const json = JSON.parse(text);
            setPackageName(json.name);
            setPackageDescription(json.description);
            setPackageAuthor(json.author);
            setPackageId(json.id);
            setResourceRows(json.replaced_resources.map(([source, target], index) => {
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
        <Stack spacing={2} m={"15px"}>
            <Stack spacing={1} sx={{ p: 1, border: "solid 1px lightgray", borderRadius: 2 }}>
                <Typography>Package Metadata</Typography>
                <TextField error={notValid} value={packageName} onChange={(e) => setPackageName(e.target.value)} variant="outlined" label="Name" />
                <TextField value={packageDescription} onChange={(e) => setPackageDescription(e.target.value)} multiline variant="outlined" label="Description" />
                <TextField value={packageAuthor} onChange={(e) => setPackageAuthor(e.target.value)} variant="outlined" label="Author" />
                <TextField disabled InputProps={{ readOnly: true }} value={packageId} onChange={(e) => setPackageId(e.target.value)} variant="outlined" label="UUID" />
                <Box sx={{ display: "flex", gap: "5px" }}>

                    {/* <Button
                        startIcon={<FileUploadRounded />}
                        variant="contained"
                        color="secondary"
                        // onClick={handleDownloadSamplePackage}
                    > Download Sample Package
                    </Button> */}

                    <Button
                        startIcon={<FileUploadRounded />}
                        variant="contained"
                        color="secondary"
                        onClick={handleLoad}
                        disabled={typeof showOpenFilePicker === "undefined"}
                    > Load from file
                    </Button>

                    <Button
                        startIcon={<SaveRounded />}
                        variant="contained"
                        color="success"
                        onClick={handleSave}
                    > Save
                    </Button>

                    <Link style={{ marginLeft: "auto", display: "inline-flex", alignItems: "flex-end" }}
                        href="static/files/ExampleMod.rop"
                        variant="body2">Download Example Package</Link>

                </Box>
            </Stack>

            <Stack spacing={1} sx={{ p: 2, border: "1px solid lightgray", borderRadius: 2 }}>
                <Button
                    startIcon={<AddRounded />}
                    variant="contained"
                    onClick={handleAddRow}
                > Add Override
                </Button>
                {
                    resourceRows.length ? resourceRows.map((row, i) =>
                        <ResourceRow
                            key={row.id}
                            index={i}
                            rowData={row}
                            onDelete={handleDeleteRow}
                        />)
                        : <Typography sx={{ opacity: 0.7 }} color="info">No overrides</Typography>

                }
            </Stack>
        </Stack>
    )
}