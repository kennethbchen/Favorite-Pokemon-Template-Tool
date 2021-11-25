"use strict";

// Image pixel measurements
const boxLength = 98;
const borderSize = 1;

// Main template grid dimensions
const gridWidth = 23;
const gridHeight = 10;

const templateLocation = "/resources/template modified.png";
const dataLocation = "/ignore/pokemon_data_simple.csv";

// Array containing CSV data from dataLocation
var data;

// In ignore folder for testing
const imagesLocation = "/ignore/all/";

// Div containing the main input table
const tableDiv = $("#tableDiv");

// The input table itself
var inputTable;

const mainImageTag = $("#mainImage");

// Column headers of the table
const colHeaders = 
["", "Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison",
 "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark",
 "Steel", "Fairy", "Starter", "Mega", "Legend", "Favorite"];

 // Row Headers of the table
const rowHeaders =
["", "I (1)", "II (2)", "III (3)", "IV (4)", "V (5)", "VI (6)", "VII (7)", "VII (8)", "Favorite"]

// ------------------------------------


// Load the CSV Data and parse it
$.ajax({
    url: dataLocation,
    dataType: "text",
}).done(function(d) {
    data = d3.csvParse(d);
});


// Initialize tableDiv
tableDiv.append($("<table>").attr("id", "mainTable"));

inputTable = $("#mainTable");

// Create rest of table
for(var row = 0; row < gridHeight; row++) {
    var tableRow = $("<tr>");

    for(var col = 0; col < gridWidth; col++) {
        
        if (row + col == 0) {
            // Handle Top left cell
            tableRow.append($("<th>"));
        } else if (row == 0) {
            // Create Vertical Headings
            tableRow.append($("<th>").text(colHeaders[col]));
        } else if (col == 0) {
            // Create Horizontal Headings
            tableRow.append($("<th>").text(rowHeaders[row]));
        } else {
            // Create Inner Cells
            // Each inner cell input tag has an id "row col"
            var data = $("<td>");
            var input = $("<input>").attr("type", "button").attr("class", "content").attr("onClick", "filterData(" + row + ", " + col + ")");
            data.append(input);
            tableRow.append(data);
        }

    }   
    
    $("#mainTable").append(tableRow);
}


// Starts top left at (0,0)
// Gives top left pixel coordinate of box [x,y]
// This is used for placing the selected images on the template
function coordToPixel(row, col) {
    // Total length from borders
    var borderX = col * borderSize + 1;
    var borderY = row * borderSize + 1;

    // Total Length from boxes
    var boxX = col * boxLength;
    var boxY = row * boxLength;

    var xCoord = borderX + boxX;
    var yCoord = borderY + boxY;

    if ( col < 0 || col >= gridWidth) {
        xCoord = 1;
    }

    if (row < 0 || row >= gridHeight) {
        yCoord = 1;
    }
    return [xCoord, yCoord];
}

/*
 TODO: Fix this stuff

// Returns a 2 dimensional list of all cell values in the input table ([row][column])
function getCellValues() {
    var output = [];

    // Row and Col start as 1 because we want to skip the headers
    for (var row = 1; row < inputTable.rows.length; row++) {
        var outputRow = [];

        for (var col = 1; col < inputTable.rows[row].cells.length; col++) {

            // Every cell accessed is an <input> tag
            // Each input tag has an id "row col"
            var element = document.getElementById(row + " " + col);
            outputRow.push(element.value);
           
        }

        output.push(outputRow);
    }

    return output;
}

// Takes the input values from the data and renders the final image
function renderImage() {
    var tableData = getCellValues();

    var imageData = [];

    // Add the base template
    imageData.push({src: templateLocation, x: 0, y:0});

    // Add images based on the table data
    for(var row = 0; row < tableData.length; row++) {
        for (var col = 0; col < tableData[row].length; col++) {

            if (tableData[row][col] !== "") {
                var coordinates = coordToPixel(row + 1, col + 1);

                // Todo, use selections based on filtered CSV input
                imageData.push({src: getImagePathFromInput(tableData[row][col]), x: coordinates[0], y: coordinates[1]});
            }
        }
    }

    mergeImages(imageData).then(b64 => mainImageTag.attr("src", b64));
}

window.renderImage = renderImage;

*/

function renderImage() {
    console.log("not yet implemented");
}

// Gets an appropriate filter based on the position in the template.
// For example, on the "Normal" column, gets a filter that selects for normal types
// Starter, Mega, and Legend filtering not implemented
function getFilterFromPos(row, col) {
    var output = {};

    // Filter column by type / other
    switch(col) {
        case 21: // Legend column, filter not implemented
        case 20: // Mega column, filter not implemented
        case 19: // Starter column filter not implemented
        case gridWidth - 1: // Favorite row, no filter
        case 0: // Header Row, invalid
            break;
        default:
            output.type = colHeaders[col].toLowerCase(); 
            break;
    }


    // Filter by generation
    switch(row) {
        case gridHeight - 1: // Favorite row, no filter
        case 0: // Header row, invalid
            break;
        default:
            output.gen = row;
            break;
    }

    return output;
    
}

// Filter the CSV data
function getFilteredData(data, filter) {
    var output;

    output = data.filter(function(row) {
        
        // If there is a type filter, then use it, else all types are allowed
        var typeMatch = (filter.type == null ? true : row.type_1 == filter.type || row.type_2 == filter.type);

        // If there is a gen filter, then use it, else all gens are allowed
        var genMatch = (filter.gen == null ? true : row.gen == filter.gen);

        return typeMatch && genMatch;

    });

    return output;
}

function filterData(row, col) {
    console.log(getFilteredData(data, getFilterFromPos(row,col)));
}


