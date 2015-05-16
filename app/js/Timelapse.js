var _ = require('underscore');

export default class Timelapse {

    constructor() {
        this.numImages = 939;
        this.targetWidth = 256;
        var sheetWidth = 2048;

        this.targetHeight = this.targetWidth*0.75;
        this.gridCols = sheetWidth/this.targetWidth;
        this.gridRows = Math.floor(this.gridCols/0.75);
        this.spritesInSheet = this.gridCols * this.gridRows;
        var numSS = Math.ceil(this.numImages/this.spritesInSheet);

        this.spritesheets = [];
        // var currentSpriteSheetIndex, currentSpriteSheetContainer, currentSpriteSheetCoords;
        var img;

        var timelapse = document.querySelector('.timelapse');
        this.timelapseLow = document.querySelector('.timelapse-low');
        this.timelapseMedium = document.querySelector('.timelapse-medium');

        for (var i = 0; i < numSS; i++) {
            img = document.createElement('div');
            img.style.backgroundImage = 'url(data/6/timelapse/spritesheet_' + i + '.jpg)'; 
            img.style.display = 'none'; 
            this.spritesheets.push(img);
            this.timelapseLow.appendChild(img);
        }

    }   

    update(r) {
        console.log(r);
        var imgIndex = Math.floor(r * this.numImages);
        var spritesheetIndex = Math.floor( imgIndex / this.spritesInSheet );

        //check against current ss index
        if (spritesheetIndex !== this.currentSpriteSheetIndex) {
            if (this.currentSpriteSheetContainer) this.currentSpriteSheetContainer.style.display = 'none';
            this.currentSpriteSheetIndex = spritesheetIndex;
            this.currentSpriteSheetContainer = this.spritesheets[spritesheetIndex];
            this.currentSpriteSheetContainer.style.display = 'block';
        }

        //get position
        var indexInSheet = imgIndex % this.spritesInSheet;
        var col = indexInSheet % this.gridCols;
        var row = Math.floor( indexInSheet / this.gridCols );

        var spriteSheetCoords = [spritesheetIndex, indexInSheet];
        // console.log(imgIndex, this.currentSpriteSheetIndex, indexInSheet, col, row);
          
        if ( ! _.isEqual( this.currentSpriteSheetCoords, spriteSheetCoords ) ) {
            var posX = col * this.targetWidth;
            var posY = row * this.targetHeight;

            this.currentSpriteSheetContainer.style.backgroundPosition = '-'+posX+'px -' + posY + 'px';
        
            clearTimeout (this.showMediumTimeout);

            if (this.mediumImage) {
                this.timelapseMedium.removeChild(this.mediumImage);
                this.timelapseMedium.style.display = 'none';
                this.timelapseLow.style.display = 'block';
                this.mediumImage.removeEventListener('load', this.onMediumImageLoaded);
                this.mediumImage = null;
            }

            this.showMediumTimeout = setTimeout( () => {
                console.log(imgIndex);
                this.mediumImage = document.createElement('img');
                this.mediumImage.addEventListener('load', this.onMediumImageLoaded.bind(this) );
                this.mediumImage.setAttribute('src', 'data/6/timelapse/medium/' + imgIndex + '.jpg');
                this.mediumImage.setAttribute('class', 'medium');
                this.timelapseMedium.appendChild(this.mediumImage);
            }, 500);
        }

        this.currentSpriteSheetCoords = spriteSheetCoords;
    }

    onMediumImageLoaded() {
        this.timelapseMedium.style.display = 'block';
        this.timelapseLow.style.display = 'none';
    }
}