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
    },
    backButton: (props) => {

    },
    empty: () => {
        return document.createElement('div');
    },
    genericListContainer: (backFn) => {
        let backBtnName = 'Back';
        const previousListItem = [...document.querySelectorAll('.screen-wrapper .generic-list-container')].at(-1);
        backBtnName = UI.lastClickedListItem?.textContent?.trim() || previousListItem?._listItems?.at(0)?.name || backBtnName;
        UI.lastClickedListItem = null;

        const list = document.querySelector('.cloneables .generic-list-container').cloneNode(true);
        list.close = function(){
            list.remove();
        }
        list.transitionAnim = () => {
            list.classList.remove('generic-list-container');
            list.offsetWidth;
            list.classList.add('generic-list-container');
        }
        if(backFn !== false){
            list.style.paddingTop = '32px';
            UI.create({
                parent: list,
                componentType: 'button',
                innerHTML: ellipsis(backBtnName, 13),
                className: 'back-btn generic-btn solid primary bold floating-top no-anim',
                onclick: () => {
                    if(backFn) backFn();
                    list.close();
                    if(previousListItem && previousListItem.transitionAnim) previousListItem.transitionAnim();
                },
                children: [
                    {
                        componentType: 'i',
                        className: 'fa-solid fa-arrow-left',
                        style: `
                            margin-right: 4px;
                        `,  
                        parentInsertBefore: true,
                    }
                ]
            })
        }
        document.querySelector('.screen-wrapper');
        return list;
    }
}