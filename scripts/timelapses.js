#!/usr/bin/env node

//node scripts/timelapses.js -s raw/photos/6/timelapse -o dist/data/6/timelapse --dry hi,low

var argv = require('yargs').argv;
var fs = require('fs');	
var path = require('path');
var execSync = require('child_process').execSync;

var sourcePath = argv.s;
var outputPath = argv.o;
var startIndex = argv.start || 0;
var dryRun = (argv.dry) ? argv.dry.split(',') : false;

var sourceFiles = fs.readdirSync(sourcePath);
sourceFiles.sort( function (fileA, fileB) {
	return fs.statSync( path.join(sourcePath, fileA) ).mtime.getTime() - fs.statSync( path.join(sourcePath , fileB) ).mtime.getTime();
});

var endIndex = argv.end || sourceFiles.length;
var numFiles = endIndex - startIndex;


console.log(argv);
//original : 3000*2250
var hiResFiles = makeHi(); //1024*768
makeMedium(); //512*384
makeSpritesheets();//256*192



function makeHi () {
	return _makeImagesFromSource('hi',  0.341333333, 100);
}

function makeMedium() {
	return _makeImagesFromSource('medium', 0.170666667, 75);
}

function _makeImagesFromSource (targetPath, resize, quality) {
	var files = [];

	for (var i = startIndex; i < endIndex; i++) {
		var file = sourceFiles[i];
		var outputFileName = ''+i;

		var sourceFile = path.resolve(path.join(sourcePath, file));
		var outputFile = path.resolve(path.join(outputPath, targetPath, outputFileName+'.jpg'));
		var cmd = 'convert ' + sourceFile
					+ ' -resize ' + (resize*100) + '% '
					+ ' -quality '+ quality + ' ' 
					+ ' ' + outputFile; 
		console.log( i + '/' + sourceFiles.length + ' ' + cmd )
		if (!dryRun || dryRun.indexOf(targetPath) === -1) execSync(cmd);

		files.push(outputFile);
	}

	return files;
}

function makeSpritesheets() {
	//make spritesheets (128*128 in 2048*2048 ss => 16x16 => 256)
	var targetWidth = 256;
	var sheetWidth = 2048;

	var targetHeight = targetWidth*.75;
	var gridCols = sheetWidth/targetWidth;
	var gridRows = Math.floor(gridCols/.75);
	var spritesInSheet = gridCols * gridRows;

	var numSS = Math.ceil(numFiles/spritesInSheet);

	for (var i = 0; i < numSS; i++) {
		var filesStr = hiResFiles.slice(i*spritesInSheet, (i+1)*spritesInSheet);
		var outputFileName = 'spritesheet_' + i;
		var outputFile = path.resolve(path.join(outputPath, outputFileName+'.jpg'));

		var cmd = 'montage ' + filesStr.join(' ') 
			+ ' -geometry ' + targetWidth + 'x' + targetHeight + '+0+0'
			+ ' -tile ' + gridCols + 'x' + gridRows
			+ ' -quality 50 '
			+ ' ' + outputFile;
		console.log(cmd)
		if (!dryRun || dryRun.indexOf('low') === -1) execSync(cmd);

	}

}


//topojson -p -o dist/data/6/1_feet_test_topo.json -- dist/data/6/1_feet_test.json 