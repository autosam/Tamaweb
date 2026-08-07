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
    fallingLeaf({
        onDespawn,
        parent,
        x = () => `${random(5, 95) + Math.random()}%`,
        y = () => `${random(25, 40)}%`,
        z = () => App.pet.z,
        ...rest
    } = {}) {
        return new Object2d({
            img: `resources/img/misc/leaves_01.png`,
            spritesheet: {
                cellSize: 13,
                cellNumber: 4,
                rows: 2,
                columns: 4,
            },
            x: x(), y: y(), z: z(),
            rotation: random(0, 180),
            parent,
            opacity: 0,
            velocity: 0.5,
            floatValue: 0,
            scale: random(5, 8) * 0.1,
            restingPositionY: random(15, 30),
            selector: 'falling_leaf',
            ...rest,
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
    },
    fallingLeafSpawner({
        maxActiveLeaves = 12,
        getNextSpawnMs = () => App.time + random(50, 4000),
        leafConfig = {},
        ...rest
    } = {}){
        let spawnedLeaves = 0, nextSpawnMs = getNextSpawnMs();
        const controllerObject = new Object2d({
            ...rest,
            onDraw: () => {
                if(App.time > nextSpawnMs && spawnedLeaves < maxActiveLeaves) {
                    nextSpawnMs = getNextSpawnMs();
                    spawnedLeaves++;
                    Prefab.fallingLeaf({
                        parent: controllerObject,
                        ...leafConfig,
                        onDespawn: () => {
                            spawnedLeaves--;
                        }
                    })
                }
            }
        });
        return controllerObject;
    },
    treeBunch({
        seed = 1,
        amount = 5,
        parent = new Object2d({ x: 0, y: 0 }),
        treeConfig = {},
        randomDisplacementRange = [-10, 10],
    } = {}) {
        pRandom.seed = seed;
        const spacing = 100 / amount;
        const possiblePositions = {
            x: new Array(amount)
                .fill(0)
                .map((_, i) => i * spacing + spacing / 2),
        };
        possiblePositions.x.forEach((x) => {
            const tree = new Object2d({
                img: `resources/img/misc/tree_01.png`,
                x: `${x + pRandom.getIntBetween(...randomDisplacementRange)}%`,
                y: pRandom.getIntBetween(0, 10),
                localZ: -1,
                width: 21,
                parent,
                isRelative: true,
                ...treeConfig,
            });
            Prefab.fallingLeafSpawner({
                parent: tree,
                maxActiveLeaves: 1,
                getNextSpawnMs: () =>
                    App.time +
                    random(
                        0,
                        App.constants.ONE_SECOND * 15,
                    ),
                leafConfig: {
                    parent: tree,
                    isRelative: true,
                    x: () => random(-5, 5),
                    y: () => random(0, 15),
                    z: () => App.pet.z + 5,
                }
            });
        })
        return parent;
    }
}
