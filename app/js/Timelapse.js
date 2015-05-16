export default class Timelapse {

    constructor() {
        this.numImages = 939;
        var targetWidth = 256;
        var sheetWidth = 2048;

        var targetHeight = targetWidth*.75;
        var gridCols = sheetWidth/targetWidth;
        var gridRows = Math.floor(gridCols/.75);
        this.spritesInSheet = gridCols * gridRows;
        var numSS = Math.ceil(numImages/spritesInSheet);

        this.spritesheets = [];
        var currentSpriteSheetIndex, currentSpriteSheetContainer, currentSpriteSheetCoords;
        var img;

        var timelapse = document.querySelector('.timelapse');
        var timelapseLow = document.querySelector('.timelapse-low');
        var timelapseMedium = document.querySelector('.timelapse-medium');

        for (var i = 0; i < numSS; i++) {
            img = document.createElement('div');
            img.style.backgroundImage = 'url(data/6/timelapse/spritesheet_' + i + '.jpg)'; 
            img.style.display = 'none'; 
            this.spritesheets.push(img);
            timelapseLow.appendChild(img);
        }

    }   

    updateTimelapse(r) {
        var imgIndex = Math.floor(r * this.numImages);
        var spritesheetIndex = Math.floor( imgIndex / spritesInSheet );

        //check against current ss index
        if (spritesheetIndex !== this.currentSpriteSheetIndex) {
            if (this.currentSpriteSheetContainer) this.currentSpriteSheetContainer.style.display = 'none';
            this.currentSpriteSheetIndex = spritesheetIndex;
            this.currentSpriteSheetContainer = this.spritesheets[spritesheetIndex];
            this.currentSpriteSheetContainer.style.display = 'block';
        }

        //get position
        var indexInSheet = imgIndex % spritesInSheet;
        var col = indexInSheet % gridCols;
        var row = Math.floor( indexInSheet / gridCols );

        var spriteSheetCoords = [spritesheetIndex, indexInSheet];
        // console.log(imgIndex, currentSpriteSheetIndex, indexInSheet, col, row)

            

            if ( ! _.isEqual( currentSpriteSheetCoords, spriteSheetCoords ) ) {
                var posX = col * targetWidth;
                var posY = row * targetHeight;

                currentSpriteSheetContainer.style.backgroundPosition = '-'+posX+'px -' + posY + 'px';
                console.log('change');

                clearTimeout (showMediumTimeout);

                if (mediumImage) {
                    timelapseMedium.removeChild(mediumImage);
                    timelapseMedium.style.display = 'none';
                    timelapseLow.style.display = 'block';
                    mediumImage.removeEventListener('load', onMediumImageLoaded);
                    mediumImage = null;
                }

                showMediumTimeout = setTimeout( function () {
                    console.log(imgIndex)
                    mediumImage = document.createElement('img');
                    mediumImage.addEventListener('load', onMediumImageLoaded)
                    mediumImage.setAttribute('src', 'data/6/timelapse/medium/' + imgIndex + '.jpg');
                    mediumImage.setAttribute('class', 'medium');
                    timelapseMedium.appendChild(mediumImage);
                    

                }, 500)
            }

            currentSpriteSheetCoords = spriteSheetCoords;

            

        });


        var onMediumImageLoaded = function() {
            timelapseMedium.style.display = 'block';
            timelapseLow.style.display = 'none';
        }