class SpriteElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.image = document.createElement("img");
        this.shadowRoot.appendChild(this.image);
    }
    updateImage() {
        const src = this.getAttribute("src");
        const width = this.getAttribute("width");
        const height = this.getAttribute("height");
        const index = this.getAttribute("index");
        const naturalWidth = this.getAttribute("naturalWidth") || this.image.naturalWidth || 64;
        const posX = this.getAttribute('pos-x') || 0;
        const posY = this.getAttribute('pos-y') || 0;
        this.image.src = src;
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



let evolvedChars = [...PET_BABY_CHARACTERS];
pRandom.seed = 1;
function generateEvols(char, lifeStage){
    this.sprite = char;

    let charName = this.sprite.slice(this.sprite.lastIndexOf('/') + 1);
    let seed = charName.replace(/\D+/g, '');
    seed += '854621';

    // const careRating =  (this.stats.current_hunger +
    //                     this.stats.current_fun +
    //                     this.stats.current_health + 
    //                     this.stats.current_sleep) / 4;

    let possibleChars = [];

    for(let i = 0; i < 3; i++){
        let sprite;
        let careRating = 100;
        if(i == 0) careRating = 0;
        if(i == 1) careRating = 50;
    
        if(careRating > 80) seed += 861;
        else if(careRating > 40) seed += 53;
        else seed += 7;
        
        // if(isNpc) seed = random(1, 99999999999);
        
        pRandom.seed = Number(seed) + 987321654;
    
        switch(lifeStage){
            case 0:
                sprite = pRandomFromArray(PET_TEEN_CHARACTERS);
                break;
            case 1:
                sprite = pRandomFromArray(PET_ADULT_CHARACTERS);
                break;
            default: return false;
        }

        possibleChars.push(sprite);
    }


    let container = document.createElement('div');
    container.innerHTML = `
        ${getCSprite(char)} -> ${getCSprite(possibleChars[0])} ${getCSprite(possibleChars[1])} ${getCSprite(possibleChars[2])}
    `;
    console.log(container);
    document.body.appendChild(container);

    evolvedChars = [...evolvedChars, ...possibleChars];
}

let growthChart = {};

function generateTree(char, lifeStage){
    let possibleChars = [];
    if(lifeStage == 0){
        for(let i = 0; i < 8; i++){
            let tries = 10000;
            let char = pRandomFromArray(PET_TEEN_CHARACTERS);
            while(evolvedChars.indexOf(char) !== -1 && tries--){
                char = pRandomFromArray(PET_TEEN_CHARACTERS);
            }
            possibleChars.push(char);
            evolvedChars.push(char);
        }
    }

    if(lifeStage == 1){
        for(let i = 0; i < 3; i++){
            let tries = 10000;
            let char = pRandomFromArray(PET_ADULT_CHARACTERS);
            while(evolvedChars.indexOf(char) !== -1 && tries--){
                char = pRandomFromArray(PET_ADULT_CHARACTERS);
            }
            possibleChars.push(char);
            evolvedChars.push(char);
        }
    }

    growthChart[char] = possibleChars;

    let container = document.createElement('div');
    container.innerHTML = `${getCSprite(char)} ->`;
    possibleChars.forEach(c => container.innerHTML += getCSprite(c));
    document.body.appendChild(container);
}

function getCSprite(char){
    let n = Number(char.replace(/\D+/g, ''));

    let size = 16;

    if(n >= 17) size = 24;
    if(n >= 133) size = 32;    

    return `<c-sprite width="${size}" height="${size}" src="/${char}"></c-sprite>`
}

// PET_BABY_CHARACTERS.forEach(char => {
//     generateTree(char, 0);
// })
// PET_TEEN_CHARACTERS.forEach(char => {
//     generateTree(char, 1);
// })

// generateTree(PET_BABY_CHARACTERS[0], 0);
PET_BABY_CHARACTERS.forEach(char => {
    generateTree(char, 0);
})
PET_TEEN_CHARACTERS.forEach(char => {
    generateTree(char, 1);
})

let all = [...PET_BABY_CHARACTERS, ...PET_TEEN_CHARACTERS, ...PET_ADULT_CHARACTERS];


let allContainer = document.createElement('div');
    allContainer.className = 'all-cont';
    document.body.appendChild(allContainer);
all.forEach(char => {
    // return;
    let element = document.createElement('div');
    element.innerHTML = getCSprite(char);
    allContainer.appendChild(element);

    if(evolvedChars.indexOf(char) == -1){
        element.style.background = 'red';
    }
})