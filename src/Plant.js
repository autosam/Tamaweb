class Plant {
    isWatered = false;
    growthDelay = App.constants.ONE_HOUR * 8;
    wateredDuration = App.constants.ONE_HOUR * 2;
    deathDuration = App.constants.ONE_HOUR * 10;

    constructor(config){
        const {
            name, 
            age = Plant.AGE.seedling, 
            lastGrowthTime = Date.now(),
            lastWatered = Date.now() - this.wateredDuration - 1000,
            health = 100,
        } = config;
        this.age = age;
        this.name = name;
        this.lastGrowthTime = lastGrowthTime;

        const defWateredDuration = this.getDefinition(name)?.wateredDuration;
        if(defWateredDuration) this.wateredDuration = defWateredDuration * 1000 * 60;

        this.health = health;

        this.lastWatered = lastWatered;
    }
    checkForProgress(){
        const now = Date.now();

        this.isWatered = (now - this.lastWatered) < this.wateredDuration || App.isWeatherEffectActive();

        // console.log((Date.now() - (this.lastGrowthTime + this.growthDelay)) / 60);
        if((now - this.lastWatered) > this.deathDuration){
            this.age = Plant.AGE.dead;
            return;
        }

        if([Plant.AGE.grown, Plant.AGE.dead].includes(this.age)) return;

        while (this.lastGrowthTime + this.growthDelay < Date.now() && this.age !== Plant.AGE.grown) {
            this.lastGrowthTime += this.growthDelay;
            this.age = clamp(this.age + 1, Plant.AGE.seedling, Plant.AGE.grown);
        }
    }
    water(){
        this.lastWatered = Date.now();
    }
    get isDead(){
        return this.age === Plant.AGE.dead;
    }
    createObject2d(patch){
        const plantDefinition = this.getDefinition();

        if(!plantDefinition) return;

        let nextPatchTick = -1;
        patch.onDraw = (me) => {
            if(App.time < nextPatchTick) return;
            nextPatchTick = App.time + 100;
            const target = this.isWatered 
                ? Plant.PATCH_IMG.wet 
                : Plant.PATCH_IMG.normal;
            if(me.imageSrc.replace(location.href, '') === target) return;
            me.setImg(target);
        }

        const position = {
            x: patch.x, y: patch.y - 10,
        }
        
        const plant = new Object2d({
            parent: patch,
            image: App.preloadedResources[App.constants.PLANT_SPRITESHEET],
            spritesheet: {
                ...App.constants.PLANT_SPRITESHEET_DIMENSIONS,
                cellNumber: plantDefinition.sprite + this.age,
            },
            ...position,
            z: App.constants.ACTIVE_PET_Z + 0.01,
            onDraw: () => {
                this.checkForProgress();
                plant.spritesheet.cellNumber = plantDefinition.sprite + this.age;
            }
        })
        const statusIndicator = new Object2d({
            parent: plant,
            img: 'resources/img/misc/no_water_01.png',
            y: position.y + 18,
            x: position.x - 7,
            z: App.constants.ACTIVE_PET_Z + 0.02,
            opacity: 0,
            onDraw: (me) => {
                if(this.isWatered) me.opacity = 0;
                me.opacity = lerp(me.opacity, this.isWatered || this.isDead ? 0 : 1, 0.001 * App.deltaTime);
            }
        })

        this.position = position;

        return {plant, statusIndicator};
    }
    getCSprite(){
        return App.getGenericCSprite(
            this.getDefinition().sprite + this.age, 
            App.constants.PLANT_SPRITESHEET, 
            App.constants.PLANT_SPRITESHEET_DIMENSIONS,
        );
    }
    getObject(){}
    getDefinition(name){
        return Plant.getDefinitionByName(name || this.name);
    }
    _reset(){
        this.age = Plant.AGE.seedling;
        this.lastGrowthTime = Date.now();
    }
    static getDefinitionByName(name){
        return App.definitions.plant[name];
    }
    static getCSprite(plantName, age = Plant.AGE.grown, className){
        return App.getGenericCSprite(
            Plant.getDefinitionByName(plantName)?.sprite + age, 
            App.constants.PLANT_SPRITESHEET, 
            App.constants.PLANT_SPRITESHEET_DIMENSIONS,
            className,
            `title="${plantName.toUpperCase()}"`
        );
    }
    static getPackCSprite(plantName, age, className){
        const plantSprite = Plant.getCSprite(plantName, Plant.AGE.grown, className);
        return `
        <div>
            <img src="resources/img/misc/seed_pack_01.png"></img>
            ${plantSprite}
        </div>
        `;
    }
    static AGE = {
        seedling: 0,
        tiny: 1,
        grown: 2,
        dead: 3,
    }
    static AGE_LABELS = Object.fromEntries(
        Object.entries(Plant.AGE).map(([key, value]) => [value, key])
    );
    
    static PATCH_IMG = {
        normal: 'resources/img/misc/garden_patch_01.png',
        wet: 'resources/img/misc/garden_patch_01_wet.png',
    }
}