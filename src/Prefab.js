const Prefab = {
    grassField({ height = 32, parent = new Object2d({})} = {}){
        for(let i = 0; i < height; i += 1){
            new Object2d({
                parent,
                img: 'resources/img/misc/grass_layer_01.png',
                x: 0,
                y: App.drawer.bounds.height - i,
                onDraw: (me) => {
                    App.pet.setLocalZBasedOnSelf(me);
                }
            })
        }
        return parent;
    },
    fallingLeaf({ onDespawn, parent } = {}){
        return new Object2d({
            img: `resources/img/misc/leaves_01.png`,
            spritesheet: {
                cellSize: 13,
                cellNumber: 4,
                rows: 2,
                columns: 4,
            },
            x: `${random(5, 85) + Math.random()}%`,
            y: `${random(25, 40)}%`,
            z: App.pet.z,
            rotation: random(0, 180),
            parent,
            opacity: 0,
            velocity: 0.5,
            floatValue: 0,
            scale: random(5, 8) * 0.1,
            restingPositionY: random(15, 30),
            selector: 'falling_leaf',
            onLateDraw: (me) => {
                if(!me.spawnX) me.spawnX = me.x;

                if(me.y > App.drawer.bounds.height - me.restingPositionY){
                    if(me.opacity <= 0) {
                        me.removeObject();
                        onDespawn?.();
                    }
                    me.opacity -= 0.0005 * App.deltaTime
                    return;
                }

                App.pet.setLocalZBasedOnSelf(me);

                me.y += me.velocity * 0.1 * App.deltaTime;
                me.opacity += 0.002 * App.deltaTime;
                me.opacity = clamp(me.opacity, 0, 0.75);
                me.floatValue += 0.0085 * App.deltaTime;
                me.x = me.spawnX + Math.sin(me.floatValue) * 5;
                me.rotation += me.velocity * 0.2 * App.deltaTime;
            }
        })
    }
}
