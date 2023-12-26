// Define a class that extends HTMLElement
class SpriteElement extends HTMLElement {
    // Define a constructor that calls the super constructor and sets up the element
    constructor() {
        super(); // Call the super constructor
        // Create a shadow root to encapsulate the element's style and content
        this.attachShadow({ mode: "open" });
        // Create an image element to display the sprite
        this.image = document.createElement("img");
        // Append the image element to the shadow root
        this.shadowRoot.appendChild(this.image);
    }
    // Define a method that updates the image element's attributes based on the element's attributes
    updateImage() {
        // Get the element's attributes
        let src = this.getAttribute("src"); // The spritesheet source
        let width = this.getAttribute("width"); // The sprite width
        let height = this.getAttribute("height"); // The sprite height
        let index = this.getAttribute("index"); // The sprite index
        let naturalWidth = this.getAttribute("naturalWidth") || this.image.naturalWidth || 64; // The sprite index
        // Set the image element's attributes
        this.image.src = src; // The spritesheet source
        this.image.width = width; // The sprite width
        this.image.height = height; // The sprite height
        // Calculate the sprite position based on the index and the width and height
        let x = (index % (naturalWidth / width)) * width; // The sprite x coordinate
        let y = Math.floor(index / (naturalWidth / width)) * height; // The sprite y coordinate
        // Set the image element's style to crop the sprite from the spritesheet
        this.image.style.objectFit = "none"; // Disable resizing the image to fit the element
        this.image.style.objectPosition = `-${x}px -${y}px`; // Set the image position to show the sprite
        this.image.style.imageRendering = 'pixelated';
    }
    // Define a method that is called when the element is connected to the document
    connectedCallback() {
        // Update the image element when the element is connected
        this.updateImage();
    }
    // Define a method that is called when the element's attributes are changed
    attributeChangedCallback(name, oldValue, newValue) {
        // Update the image element when the element's attributes are changed
        this.updateImage();
    }
    // Define a static property that returns an array of the element's observed attributes
    static get observedAttributes() {
        // Observe the src, width, height, and index attributes
        return ["src", "width", "height", "index"];
    }
}

customElements.define("c-sprite", SpriteElement);

App.init();