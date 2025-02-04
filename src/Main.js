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
    if(!navigator?.serviceWorker || App.isOnItch) return;
    
    let shownControllerChangeModal = false;
    navigator?.serviceWorker?.register('service-worker.js').then((registration) => {
        console.log('Service Worker Registered')
        // if(registration.active){
        //     setTimeout(() => App.checkPetStats(), 500)
        // }
    });
    navigator?.serviceWorker?.addEventListener('controllerchange', () => {
        if(!shownControllerChangeModal && !App.isOnItch){
            shownControllerChangeModal = true;
            document.querySelector('#download-container').style.display = 'none';
            document.querySelector('#download-complete-container').style.display = '';
        }
    })

    const channel = new BroadcastChannel('sw-messages');
    channel.addEventListener('message', event => {
        switch(event.data.type){
            case "install":
                if(!App.awayTime || App.isOnItch) break;
                const downloadContainer = document.querySelector('#download-container');
                downloadContainer.style.display = '';
                downloadContainer.onclick = () => {
                    downloadContainer.style.display = 'none';
                }
                break;
        }
    });
}

function setupFirebase(){
    if(typeof firebase === undefined) return;

    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyAfGAIhUNAFY1VgZmtp71edZjMF3Ss1hCE",
        authDomain: "tamawebdb.firebaseapp.com",
        projectId: "tamawebdb",
        storageBucket: "tamawebdb.firebasestorage.app",
        messagingSenderId: "405198385098",
        appId: "1:405198385098:web:2562998641a31ec976a933",
        measurementId: "G-LWNYV05LFT"
    };
    
    firebase.initializeApp(firebaseConfig);

    // Initialize Firestore
    const db = firebase.firestore();


    

    // Retrieve user documents
    db.collection("users").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // Access data and likes fields
            var userData = doc.data().data;
            var userLikes = doc.data().likes;
            console.log(doc)
            console.log(`Data: ${userData}, Likes: ${userLikes}`);
        });
    }).catch(function(error) {
        console.error("Error retrieving documents: ", error);
    });

}

setupFirebase();
handleServiceWorker();
App.init();