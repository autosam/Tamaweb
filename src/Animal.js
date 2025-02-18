class Animal extends Pet {
    constructor(petDefinition, additionalProps){
        super(petDefinition, {
            ...additionalProps, 
            calculateStats: true
        })
    }
    onDraw(){
        this.z = App.constants.ACTIVE_PET_Z - (1 - this.y * 0.01);
    }
    wander(){
        if(this.isMoving){
            this.nextRandomTargetSelect = 0;
        }

        if (!this.nextRandomTargetSelect) {
            this.nextRandomTargetSelect = App.lastTime + random(this.stats.wander_min, this.stats.wander_max) * 1000;
        }

        if (App.lastTime > this.nextRandomTargetSelect) {
            this.targetX = random(this.drawer.getRelativePositionX(0), this.drawer.getRelativePositionX(100) - this.spritesheet.cellSize);
            this.targetY = random(this.drawer.getRelativePositionY(100) - this.spritesheet.cellSize/2, this.drawer.getRelativePositionY(75));
            this.nextRandomTargetSelect = 0;
        }
    }
} 