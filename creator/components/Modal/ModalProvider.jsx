import { useState, useContext, createContext } from "react";

const ModalContext = createContext();

export function useModal() {
    return useContext(ModalContext);
}

export function ModalProvider({ children }) {
    const [modal, setModal] = useState({
        isShowing: false,
        title: '',
        body: '',
        buttons: null,
    });

    function showModal(title, body, buttons) {
        setModal({
            isShowing: true,
            title,
            body,
            buttons,
        });
    }

    function hideModal() {
        setModal({ ...modal, isShowing: false });
    }

    function getModalState(){
        return modal.isShowing;
    }

    return (
        <ModalContext.Provider value={{ ...modal, showModal, hideModal, getModalState }}>
            {children}
        </ModalContext.Provider>
    );
}