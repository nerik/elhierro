#!/usr/bin/env node

var fs = require('fs');
var moment = require('moment');

var data = fs.readFileSync('catalogoComunSV_1433769573224.txt', {encoding: 'utf-8'});

var lines = data.split('\n');
var csvLines = [];

//skip first line
for (var i = 1; i < lines.length; i++) {
    var line = lines[i];
    var cursor = 12;
    var cells = [ line.substring(0, cursor+1).trim() ];

    for (var j = 0; j < 9; j++) {
        var cell = line.substring(cursor, cursor+16)
        cells.push( cell.trim() );
        cursor += 15;
    };

    var d = moment( cells[1] + cells[2], 'DD/MM/YYYYHH:mm:ss' )
    cells.push( d.format() )

    csvLines.push ( cells.join(',') + ';' )
    
};

console.log('Evento,Fecha,Hora,Latitud,Longitud,Prof. (Km),Inten.,Mag.,Tipo Mag.,Localización,datetime;')

csvLines.forEach( function(line) {
    console.log (line)
} )