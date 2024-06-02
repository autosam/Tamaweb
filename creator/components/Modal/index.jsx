import { useModal } from './ModalProvider';

export default function Modal() {
    const { isShowing, title, body, buttons, hideModal } = useModal();

    if (!isShowing) return null;

    return (
        <div className="modal" style={{display: 'unset'}} tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" onClick={hideModal}></button>
                    </div>
                    <div className="modal-body">
                        <p>{body}</p>
                    </div>
                    <div className="modal-footer">
                        {buttons ? buttons.map((button, index) => (
                            <button key={index} type="button" className={`btn ${button.className}`} onClick={button.onClick}>
                                {button.text}
                            </button>
                        )) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}