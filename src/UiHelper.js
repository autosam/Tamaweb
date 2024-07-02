const UI = {
    specialProps: [
        'componentType',
        'parent',
        'children',
    ],
    create: (props) => {
        return UI.ce(props);
    },
    ce: (props) => {
        const e = document.createElement(props?.componentType || 'div');

        Object.keys(props).forEach(propName => {

            if(UI.specialProps.includes(propName)){
                switch(propName){
                    case 'children':
                        props.children.forEach((child) => {
                            UI.ce({
                                ...child,
                                parent: e
                            })
                        })
                        break
                    case 'parent':
                        if(props.parentInsertBefore)
                            props.parent.insertBefore(e, props.parent.firstChild)
                        else
                            props.parent.appendChild(e);
                        break;
                }
                return;
            }

            e[propName] = props[propName];
            // e.setAttribute(prop, props[prop]);
        })
        return e;
    },
    genericButton: (props) => {
        return UI.ce({
            ...props,
            componentType: 'button',
            className: 'cila-btn',
        })
    },
    genericFlexContainer: (props) => {
        const element = UI.ce({
            classList: ['cila-generic-flex-container'],
            parent: document.querySelector('.screen-wrapper'),
        })
        element.close = () => element.remove();
        return element;
    }
}