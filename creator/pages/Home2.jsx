import { useModal } from "../components/Modal/ModalProvider";

import { Button, Container, Box } from "@mui/material";
import { DeleteOutlineRounded } from "@mui/icons-material";

export default function Home() {
    const { showModal, hideModal } = useModal();
    
    function openModal() {
        showModal(
            'My Modal Title',
            'This is the modal body',
            [
                { text: 'Close', className: 'btn-secondary', onClick: () => hideModal() },
                { text: 'Save changes', className: 'btn-primary', onClick: () => console.log('Changes saved!') },
            ]
        );
    }

    return (
        <>
        <Box component="section" m={"10px"}>
            <Button onClick={openModal} variant="contained" disableElevation>
                <DeleteOutlineRounded /> show modal
            </Button>
        </Box>
        </>
    )
}