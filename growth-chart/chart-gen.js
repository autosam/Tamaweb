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

function generateTree(char, lifeStage, parent){
    let possibleChars = [];
    if(lifeStage == 0){
        for(let i = 0; i < 3; i++){
            let tries = 10000;
            let char = pRandomFromArray(PET_CHILD_CHARACTERS);
            while(evolvedChars.indexOf(char) !== -1 && tries--){
                char = pRandomFromArray(PET_CHILD_CHARACTERS);
            }
            possibleChars.push(char);
            evolvedChars.push(char);
        }
    }

    if(lifeStage == 0.5){
        for(let i = 0; i < 3; i++){
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

    if(lifeStage == 2){
        for(let i = 0; i < 1; i++){
            let tries = 10000;
            let char = pRandomFromArray(PET_ELDER_CHARACTERS);
            while(evolvedChars.indexOf(char) !== -1 && tries--){
                char = pRandomFromArray(PET_ELDER_CHARACTERS);
            }
            possibleChars.push(char);
            evolvedChars.push(char);
        }
    }

    growthChart[char] = possibleChars;

    let container = document.createElement('div');
        container.className = 'char-container';
    container.innerHTML = `${getCSprite(char)} ⤳`;

   /*  if(lifeStage == 0){
        possibleChars.forEach((c, i) => {
            container.innerHTML += getCSprite(c, i >= 4 ? 'high-care' : 'low-care');
        })
    } else if(lifeStage == 0.5){
        possibleChars.forEach((c, i) => {
            container.innerHTML += getCSprite(c, i >= 4 ? 'high-care' : 'low-care');
        })
    } else if(lifeStage == 1){
        possibleChars.forEach((c, i) => {
            var cls = 'high-care';
            if(i == 0) cls = 'low-care';
            else if(i == 1) cls = 'med-care';

            container.innerHTML += getCSprite(c, cls);
        })
    } */

    if(lifeStage <= 2){
        possibleChars.forEach((c, i) => {
            var cls = 'high-care';
            if(i == 0) cls = 'low-care';
            else if(i == 1) cls = 'med-care';

            container.innerHTML += getCSprite(c, cls);
        })
    }
    // possibleChars.forEach(c => container.innerHTML += getCSprite(c));
    (parent || document.body).appendChild(container);

    return container;
}

function toggleCSpriteVisibility(char) {
    const all = document.querySelectorAll(`c-sprite[src="../${char}"]`);
    if ([...all[0].classList].includes('active')) {
        all.forEach(item => {
            item.classList.remove('active');
        })
    } else {
        all.forEach(item => {
            item.classList.add('active');
        })
    }
}

function getCSprite(char, cls){
    let n = Number(char.replace(/\D+/g, ''));

    let size = 16;

    if(n >= 17) size = 24;
    if(n >= 133) size = 32;

    const nChar = `${char}`;

    return `<c-sprite title="${nChar}" onclick="toggleCSpriteVisibility('${nChar}')" width="${size}" height="${size}" src="../${nChar}" class="${cls}"></c-sprite>`
}

// PET_BABY_CHARACTERS.forEach(char => {
//     generateTree(char, 0);
// })
// PET_TEEN_CHARACTERS.forEach(char => {
//     generateTree(char, 1);
// })

// generateTree(PET_BABY_CHARACTERS[0], 0);
PET_BABY_CHARACTERS.forEach((char, i) => {
    let cont = generateTree(char, 0, document.querySelector('.babies'));
})

PET_CHILD_CHARACTERS.forEach(char => {
    generateTree(char, 0.5, document.querySelector('.children'));
})

PET_TEEN_CHARACTERS.forEach(char => {
    generateTree(char, 1, document.querySelector('.teens'));
})

PET_ADULT_CHARACTERS.forEach(char => {
    generateTree(char, 2, document.querySelector('.elders'));
})

let all = [...PET_BABY_CHARACTERS, ...PET_TEEN_CHARACTERS, ...PET_ADULT_CHARACTERS];

console.log('growth chart:');
console.log(JSON.stringify(growthChart).replaceAll('resources/img/character/chara_', '%'));

let allContainer = document.createElement('div');
    allContainer.className = 'all-cont';
    document.body.appendChild(allContainer);
all.forEach(char => {
    return;
    let element = document.createElement('div');
    element.innerHTML = getCSprite(char);
    allContainer.appendChild(element);

    if(evolvedChars.indexOf(char) == -1){
        element.style.background = 'red';
    }
})