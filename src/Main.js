class SpriteElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.image = document.createElement("img");
        this.shadowRoot.appendChild(this.image);
        this.image.style['-webkit-user-drag'] = 'none'
    }
    updateImage() {
        const src = this.getAttribute("src");
        const width = this.getAttribute("width");
        const height = this.getAttribute("height");
        const index = this.getAttribute("index");
        const naturalWidth = this.getAttribute("naturalWidth") || this.image.naturalWidth || 64;
        const posX = this.getAttribute('pos-x') || 0;
        const posY = this.getAttribute('pos-y') || 0;
        this.image.src = App.checkResourceOverride(src);
        this.image.width = width;
        this.image.height = height;
        const x = (index % (naturalWidth / width)) * width;
        const y = Math.floor(index / (naturalWidth / width)) * height;
        this.image.style.objectFit = "none";
        this.image.style.objectPosition = `-${x + posX}px -${y + posY}px`;
        this.image.style.imageRendering = 'pixelated';
    }
    connectedCallback() {
        this.updateImage();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this.updateImage();
    }
    static get observedAttributes() {
        return ["src", "width", "height", "index"];
    }
}

customElements.define("c-sprite", SpriteElement);

function handleServiceWorker(){
    const isOnItch = location.host.indexOf('itch') !== -1;
    if(!navigator?.serviceWorker || isOnItch) return;
    
    let shownControllerChangeModal = false;
    navigator?.serviceWorker?.register('service-worker.js').then((registration) => {
        console.log('Service Worker Registered')
    });
    navigator?.serviceWorker?.addEventListener('controllerchange', () => {
        if(!shownControllerChangeModal && !isOnItch){
            shownControllerChangeModal = true;
            document.querySelector('#download-container').style.display = 'none';
            document.querySelector('#download-complete-container').style.display = '';
        }
    })

    const channel = new BroadcastChannel('sw-messages');
    channel.addEventListener('message', event => {
        switch(event.data.type){
            case "install":
                if(!App.awayTime || isOnItch) break;
                const downloadContainer = document.querySelector('#download-container');
                downloadContainer.style.display = '';
                downloadContainer.onclick = () => {
                    downloadContainer.style.display = 'none';
                }
                break;
        }
    });
}

handleServiceWorker();
App.init();