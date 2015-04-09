#!/usr/bin/env node
var argv = require('yargs').argv;
var fs = require('fs');	
var path = require('path');
var execSync = require('child_process').execSync;

var sourcePath = argv.s;
var outputPath = argv.o;
var startIndex = argv.start || 0;
var dryRun = argv.dry || false;

var sourceFiles = fs.readdirSync(sourcePath);
sourceFiles.sort( function (fileA, fileB) {
	return fs.statSync( path.join(sourcePath, fileA) ).mtime.getTime() - fs.statSync( path.join(sourcePath , fileB) ).mtime.getTime();
});

var endIndex = argv.end || sourceFiles.length;
var numFiles = endIndex - startIndex;

var hiResFiles = makeHi();
makeSpritesheets();

function makeHi () {
	
	var hiResFiles = [];
	//make hi-res (1024*768)
	for (var i = startIndex; i < endIndex; i++) {
		var file = sourceFiles[i];
		var outputFileName = ''+i;

		var sourceFile = path.resolve(path.join(sourcePath, file));
		var outputFile = path.resolve(path.join(outputPath, 'hi', outputFileName+'.jpg'));
		var cmd ='convert ' + sourceFile + ' -resize 34.1333333% -quality 80 ' + outputFile; 
		console.log( i + '/' + sourceFiles.length + ' ' + cmd)
		if (!dryRun) execSync(cmd);

		hiResFiles.push(outputFile);
	}

	return hiResFiles;
}

function makeSpritesheets() {
	//make spritesheets (128*128 in 2048*2048 ss => 16x16 => 256)
	var targetWidth = 256;
	var targetHeight = 256*.75;
	var sheetWidth = 4096;

	var gridCols = sheetWidth/targetWidth;
	var gridRows = Math.floor(gridCols/.75);
	var spritesInSheet = gridCols * gridRows;

	var numSS = Math.ceil(numFiles/spritesInSheet);

	for (var i = 0; i < numSS; i++) {
		var filesStr = hiResFiles.slice(i*spritesInSheet, (i+1)*spritesInSheet);
		var cmd = 'montage ' + filesStr.join(' ') + ' -geometry ' + targetWidth + 'x' + targetHeight + '+0+0 spritesheet_' + i + '.jpg';
		console.log(cmd)
		if (!dryRun) execSync(cmd);

	};

}