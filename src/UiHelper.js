const UI={specialProps:["componentType","parent","children"],create:props=>UI.ce(props),ce:props=>{const e=document.createElement(props?.componentType||"div");return Object.keys(props).forEach((propName=>{if(UI.specialProps.includes(propName))switch(propName){case"children":props.children.forEach((child=>{UI.ce({...child,parent:e})}));break;case"parent":props.parentInsertBefore?props.parent.insertBefore(e,props.parent.firstChild):props.parent.appendChild(e)}else e[propName]=props[propName]})),e},genericButton:props=>UI.ce({...props,componentType:"button",className:"cila-btn"}),genericFlexContainer:props=>{const element=UI.ce({classList:["cila-generic-flex-container"],parent:document.querySelector(".screen-wrapper")});return element.close=()=>element.remove(),element},empty:className=>{const e=document.createElement("div");return className&&(e.className=className),e},genericListContainer:(backFn,backFnTitle)=>{let backBtnName="Back";const activeListContainers=[...document.querySelectorAll(".screen-wrapper .generic-list-container")],previousListItem=activeListContainers?.at(-1);activeListContainers.length>0&&(backBtnName=backFnTitle||UI.lastClickedButton?.textContent?.trim()?.replace(" new!","")||previousListItem?._listItems?.at(0)?.name||backBtnName),UI.lastClickedButton=null;const list=document.querySelector(".cloneables .generic-list-container").cloneNode(!0);return list.close=function(){list.remove()},list.transitionAnim=()=>{list.classList.remove("menu-animation"),list.offsetWidth,list.classList.add("menu-animation")},!1!==backFn&&(list.style.paddingTop="0",UI.create({parent:list,componentType:"button",innerHTML:ellipsis(backBtnName,13),className:"back-btn generic-btn solid primary bold sticky-top no-anim",onclick:()=>{backFn&&backFn(),list.close()},children:[{componentType:"i",className:"fa-solid fa-arrow-left",style:"\n                            margin-right: 4px;\n                        ",parentInsertBefore:!0}]})),document.querySelector(".screen-wrapper").appendChild(list),list},clearLastClicked:()=>{UI.lastClickedButton=null},genericListContainerContent:(contentString,listContainer)=>{const content=UI.empty();return content.innerHTML=contentString,listContainer?.appendChild(content),content},fadeOut:(element,timeMs,onEnd)=>{timeMs||(timeMs=300),element.classList.add("fade-out"),element.style["animation-duration"]=`${timeMs}ms`,setTimeout((()=>{UI.hide(element),onEnd&&onEnd(element)}),timeMs)},hide:element=>{element.style.display="none"},show:element=>{element.style.display=""}};