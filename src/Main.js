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

/* Object.defineProperty(HTMLElement.prototype, 'safeInnerHTML', {
    get: function() {
        return this.innerHTML;
    },
    set: function(content) {
        // const sanitizedContent = DOMPurify.sanitize(content);
        const sanitizedContent = sanitize(content);
        this.innerHTML = sanitizedContent;
    }
}); */

class AudioChannel {
    audioContext = new AudioContext();
    audioBufferCache = new Map();
    currentSource = null;
    isBusy = false;
    constructor(props = {}){
        const { preloadList } = props;

        if(preloadList){
            preloadList.forEach(path => this.load(path));
        }

    }
    async load(path){
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.audioBufferCache.set(path, audioBuffer);
        return audioBuffer;
    }
    async play(path, force) {
        if (this.isBusy && !force) return;

        const buffer = this.audioBufferCache.get(path) ?? await this.load(path);

        if (force && this.currentSource) {
            try {
                this.currentSource.stop();
            } catch (e) {}
            this.currentSource.disconnect();
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);

        this.currentSource = source;
        this.isBusy = true;

        source.onended = () => {
            this.isBusy = false;
            this.currentSource = null;
        };
    }
}

class CodeObf {
  constructor(secret = 123) {
    this.secret = secret;
    this.chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  }
  b62e(bytes) {
    let n = 0n;
    for (let b of bytes) n = (n << 8n) + BigInt(b);
    let out = "";
    while (n > 0) {
      out = this.chars[n % 62n] + out;
      n /= 62n;
    }
    return out || "0";
  }
  b62d(str) {
    let n = 0n;
    for (let c of str) n = n * 62n + BigInt(this.chars.indexOf(c));
    const hex = n.toString(16).padStart((n.toString(16).length + 1) & ~1, "0");
    return Uint8Array.from(hex.match(/../g).map(h => parseInt(h, 16)));
  }
  encode(str) {
    const bytes = [...new TextEncoder().encode(str)];
    
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] ^= (this.secret + i * 17) & 0xFF;
    }

    const sum = bytes.reduce((a, b) => (a + b) & 0xFF, 0);
    bytes.push(sum);

    return this.b62e(bytes);
  }
  decode(code) {
    const bytes = [...this.b62d(code)];
    if (bytes.length < 2) return { ok: false, error: "too short" };

    const checksum = bytes.pop();

    const sum = bytes.reduce((a, b) => (a + b) & 0xFF, 0);
    if ((sum & 0xFF) !== checksum)
      return { ok: false, error: "checksum mismatch" };

    for (let i = 0; i < bytes.length; i++) {
      bytes[i] ^= (this.secret + i * 17) & 0xFF;
    }

    return {
      ok: true,
      data: new TextDecoder().decode(new Uint8Array(bytes))
    };
  }
}
const codeObf = new CodeObf(`Secret_V_${window?.VERSION}`);


function handleServiceWorker(){
    const isOnItch = location.host.indexOf('itch') !== -1;
    if(!navigator?.serviceWorker || isOnItch) return;
    
    let shownControllerChangeModal = false;
    navigator?.serviceWorker?.register('service-worker.js').then((registration) => {
        console.log('Service Worker Registered')
    });
    navigator?.serviceWorker?.addEventListener('controllerchange', () => {
        if(!shownControllerChangeModal && !isOnItch && App.awayTime){
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

const showError = (msg, stack) => {
    const element = document.querySelector('#loading-error');
    element.innerHTML = `<i class="fa-solid fa-warning"></i> ${sanitize(msg)}`;
    element.onclick = () => {
        if(!stack) return;
        showError(stack, msg);
    }
    return;
    document.querySelector('.error-container').style.display = ''
    document.querySelector('#error-message').textContent = msg;
}
window.onerror = (message) => {
    showError(message);
    App.sendErrorLog(message);
}
window.onunhandledrejection = (event) => {
    const reason = event?.reason;
    const message = typeof reason === 'string' ? reason : reason?.message || 'Unknown rejection';
    const stack = reason?.stack || false;

    showError(event?.reason, event?.reason?.stack);
    if(stack) App.sendErrorLog(`${message} - ${stack}`);
}

handleServiceWorker();
App.init();