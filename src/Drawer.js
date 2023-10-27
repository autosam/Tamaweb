class Drawer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        // this.bounds = canvas.getBoundingClientRect();
        this.bounds = {
            width: this.canvas.width,
            height: this.canvas.height
        }
        this.objects = [];
    }
    draw() {
        this.clear();
        this.objects.forEach(object => {
            if(!object || object.hidden) return;

            if (object.onDraw !== undefined)
                object.onDraw();

            if (object.x.toString().indexOf('%') >= 0) {
                let width = object.spritesheet ? object.spritesheet.cellSize : object.width || object.image.width;
                object.x = this.getRelativePositionX(Number(object.x.toString().slice(0, object.x.toString().length - 1))) - width / 2;
            }
            if (object.y.toString().indexOf('%') >= 0) {
                let height = object.spritesheet ? object.spritesheet.cellSize : object.height || object.image.height;
                object.y = this.getRelativePositionY(Number(object.y.slice(0, object.y.length - 1))) - height / 2;
            }

            let x = object.x,
                y = object.y;

            if (object.additionalX) x += object.additionalX;
            if (object.additionalY) y += object.additionalY;

            // fixes blurriness on some frames
            y = Math.round(y);
            x = Math.round(x);

            if (object.inverted) {
                this.context.save();
                this.context.scale(-1, 1);
                if(object.spritesheet){
                    let cellNumber = object.spritesheet.cellNumber - 1;
                    this.context.drawImage(
                        object.image,
                        (cellNumber % object.spritesheet.rows) * object.spritesheet.cellSize,
                        Math.floor(cellNumber / object.spritesheet.columns) * object.spritesheet.cellSize,
                        object.spritesheet.cellSize,
                        object.spritesheet.cellSize,
                        -x - object.spritesheet.cellSize,
                        y,
                        object.spritesheet.cellSize,
                        object.spritesheet.cellSize
                    );
                }
                this.context.restore();
            } else {
                if(object.spritesheet){
                    let cellNumber = object.spritesheet.cellNumber - 1;
                    this.context.drawImage(
                        object.image,
                        (cellNumber % object.spritesheet.rows) * object.spritesheet.cellSize,
                        Math.floor(cellNumber / object.spritesheet.columns) * object.spritesheet.cellSize,
                        object.spritesheet.cellSize,
                        object.spritesheet.cellSize,
                        x,
                        y,
                        object.spritesheet.cellSize,
                        object.spritesheet.cellSize
                    );
                } else {
                    this.context.drawImage(
                        object.image,
                        x,
                        y,
                        object.width || object.image.width,
                        object.height || object.image.height
                    )
                }
            }

            if (object.onLateDraw !== undefined)
                object.onLateDraw();
        })
    }
    clear() {
        this.context.clearRect(0, 0, this.bounds.width, this.bounds.height);
    }
    getRelativePositionX(percent) {
        return percent / 100 * this.bounds.width;
    }
    getRelativePositionY(percent) {
        return percent / 100 * this.bounds.height;
    }
    addObject(object) {
        let id = this.objects.push(object);
        object.drawerId = id - 1;
        return object.drawerId;
    }
    removeObject(object) {
        if(!object || object.drawerId === undefined){
            console.log('no drawer id, cant remove', object);
        }
        this.objects[object.drawerId] = null;
    }
}