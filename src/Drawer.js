class Drawer {
    constructor(canvas, optWidth, optHeight) {
        if(!canvas) {
            canvas = document.createElement('canvas');
            canvas.setAttribute('width', optWidth);
            canvas.setAttribute('height', optHeight);
        }
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.context.fillStyle = 'white';
        this.context.font = '8px Calibri';

        this.context.msImageSmoothingEnabled = false;
        this.context.mozImageSmoothingEnabled = false;
        this.context.webkitImageSmoothingEnabled = false;
        this.context.imageSmoothingEnabled = false;
        // this.bounds = canvas.getBoundingClientRect();
        this.bounds = {
            width: optWidth || this.canvas.width,
            height: optHeight || this.canvas.height
        }
        this.objects = [];
    }
    draw(objects, skipClear) {
        if(!skipClear) this.clear();
        if(!objects) objects = this.objects;

        // sorting based on z
        objects = objects.filter(object => object).sort((a, b) => (a.z || 0) - (b.z || 0));

        objects.forEach(object => {
            if(!object || object.hidden || object.absHidden) return;

            if (object.onDraw !== undefined)
                object.onDraw(object);

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

            function drawSprite(object, x, y, context) {
                const { image, spritesheet, inverted, upperHalfOffsetY, scale, width, height, clipCircle, rotation, composite, opacity } = object;
                if (!image) return;

                context.save();

                const spriteCenterX = x + (spritesheet ? spritesheet.cellSize / 2 : (width || image.width) / 2);
                const spriteCenterY = y + (spritesheet ? spritesheet.cellSize / 2 : (height || image.height) / 2);

                if (scale) {
                    context.translate(spriteCenterX, spriteCenterY);
                    context.scale(scale, scale);
                    context.translate(-spriteCenterX, -spriteCenterY);
                }
                
                if (rotation) {
                    const rotationRadians = rotation * (Math.PI / 180);
                    context.translate(spriteCenterX, spriteCenterY);
                    context.rotate(rotationRadians);
                    context.translate(-spriteCenterX, -spriteCenterY);
                }

                if (clipCircle) {
                    const radius = Math.min((width || image.width), (height || image.height)) / 2; // for a circle, radius is half of the smaller dimension

                    context.beginPath();
                    context.arc(spriteCenterX, spriteCenterY, radius, 0, Math.PI * 2, false);
                    context.clip();
                }

                if (inverted) {
                    context.scale(-1, 1);
                    x = -x - (spritesheet ? spritesheet.cellSize : (width || image.width));
                }

                if (composite) {
                    context.globalCompositeOperation = "multiply";
                }

                if (opacity) {
                    context.globalAlpha = opacity;
                }

                if (spritesheet) {
                    const cellNumber = spritesheet.cellNumber - 1;
                    const cellSize = spritesheet.cellSize;
                    const rows = spritesheet.rows;
                    const columns = spritesheet.columns;
                    const sx = (cellNumber % rows) * cellSize;
                    const sy = Math.floor(cellNumber / columns) * cellSize;

                    const upperHalfHeight = Math.round((4 / 5) * cellSize);
                    const lowerHalfHeight = (cellSize - upperHalfHeight);

                    const drawHalf = (half, offsetY) => {
                        let dy = y; // destination y coordinate
                        let sh = half === 0 ? upperHalfHeight : lowerHalfHeight; // source height
                        let dh = sh; // destination height

                        if (half === 0 && offsetY) dy += offsetY; // applying offset to upper half

                        context.drawImage(
                            image,
                            sx,
                            sy + (half === 0 ? 0 : upperHalfHeight), // adjusting source y for lower half
                            cellSize,
                            sh, // using calculated height for the half
                            x,
                            dy + (half === 0 ? 0 : upperHalfHeight), // adjusting destination y for lower half
                            cellSize,
                            dh // using calculated height for the half
                        );
                    };

                    drawHalf(0, upperHalfOffsetY); // drawing upper half with offset
                    drawHalf(1); // drawing lower half
                } else {
                    context.drawImage(image, x, y, (object.width || image.width), (object.height || image.height));
                }

                context.restore();
            }

            drawSprite(object, x, y, this.context);
            
            /* if(object.dirtyCircle){
                this.context.globalCompositeOperation = "color";
                // this.context.globalCompositeOperation = "multiply";
                // this.context.fillStyle = 'rgba(124, 55, 29, 1)'; // Red tint
                // this.context.ellipse(x, y, object.spritesheet.cellSize, object.spritesheet.cellSize, 0, 0, 360);
                // this.context.fill();
                // this.context.fillRect(x, y, object.spritesheet.cellSize, object.spritesheet.cellSize); // Apply the tint to a specific area
                
                this.context.beginPath();
                this.context.arc(x + object.spritesheet.cellSize / 2, y + object.spritesheet.cellSize / 2, 8, 0, 2 * Math.PI, false);
                this.context.fillStyle = 'rgba(124, 55, 29, 1)';
                this.context.fill();
                this.context.lineWidth = 0;
                // this.context.strokeStyle = '#003300';
                // this.context.stroke();

                this.context.globalCompositeOperation = 'source-over';
            } */

            if(object.dirtyPatches){
                let hCell = object.spritesheet.cellSize / 2;
                this.context.globalCompositeOperation = "color";
                this.context.globalCompositeOperation = "multiply";

                let areas = [
                    [hCell - 0, hCell, 3],
                    [hCell + 3, hCell - 3, 2],
                    [hCell - 2, hCell + 2, 2],
                    // [hCell, hCell, 3],
                ]
                areas = [];

                pRandom.save();
                pRandom.seed = 1;
                for(let i = 0; i < 8; i++){
                    areas.push([
                        hCell - pRandom.getIntBetween(-6, 6),
                        hCell - pRandom.getIntBetween(-6, 6),
                        pRandom.getIntBetween(1, 6)
                    ])
                }
                pRandom.load();
                
                areas.forEach(area => {
                    this.context.beginPath();
                    this.context.arc(x + area[0], y + area[1], area[2], 0, 2 * Math.PI, false);
                    this.context.fillStyle = 'rgba(124, 55, 29, 0.6)';
                    this.context.fill();
                    this.context.lineWidth = 0;
                })


                this.context.globalCompositeOperation = 'source-over';
            }

            if (object.text){
                this.context.fillText(object.text, x, y);
            }

            if (object.onLateDraw !== undefined)
                object.onLateDraw();
        })
        return this;
    }
    pixelate(){
        let w = this.bounds.width * 0.4,
            h = this.bounds.height * 0.4;
        this.context.drawImage(this.canvas, 0, 0, w, h);
        this.context.drawImage(this.canvas, 0, 0, w, h, 0, 0, this.bounds.width, this.bounds.height);
    }
    drawImmediate(entity){
        if(entity.image){
            let img = new Image();
                img.src = entity.image;
                entity.image = img;
        }
        
        this.draw([entity], true);
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
            return console.log('no drawer id, cant remove', object);
        }

        this.objects[object.drawerId] = null;
        this.objects.forEach(otherObject => {
            if(otherObject?.parent?.drawerId === object.drawerId){
                this.objects[otherObject.drawerId] = null;
            }
        })
    }
}