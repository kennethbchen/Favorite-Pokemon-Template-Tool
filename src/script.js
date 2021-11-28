"use strict";

// Image pixel measurements
const boxLength = 98;
const borderSize = 1;

// Main template grid dimensions
const gridWidth = 23;
const gridHeight = 10;

const templateLocation = "/resources/template modified.png";
const dataLocation = "/ignore/pokemon_data_simple.csv";

// In ignore folder for testing
const imagesLocation = "/ignore/all/";

// ------------------------------------

// Submit Button
const submitButton = document.getElementById("submitButton");

// The main input table itself
const inputTable = document.getElementById("mainTable");

// The main image that is displayed
const mainImage = document.getElementById("mainImage");

// ------------------------------------

// Div containing the menu overlay. Essentially the background of the overlay
const overlayDiv = document.getElementById("overlay");

// Div containing the actual content of the menu overlay.
const overlayContent = document.getElementById("overlayContent");

// The table that contains all selectable pokemon in the overlay menu
const selectionTable = document.getElementById("selectionTable");

// The input field that is used to search in the overlay menu
const selectionSearchBar = document.getElementById("selectionSearchBar");

// ------------------------------------

// Column headers of the table
const colHeaders = 
["", "Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison",
 "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark",
 "Steel", "Fairy", "Starter", "Mega", "Legend", "Favorite"];

 // Row Headers of the table
const rowHeaders =
["", "I (1)", "II (2)", "III (3)", "IV (4)", "V (5)", "VI (6)", "VII (7)", "VII (8)", "Favorite"];

// Array containing CSV data from dataLocation
// Array of javascript objects
var data;

// ------------------------------------

// Get and parse CSV data
var request = new XMLHttpRequest();
request.onreadystatechange = function() {
    if(request.readyState == XMLHttpRequest.DONE) {
        data = d3.csvParse(request.responseText);
    }
}
request.open("get", dataLocation, true);
request.send();

// Create rest of table
for(var row = 0; row < gridHeight; row++) {
    var tableRow = document.createElement("tr");

    for(var col = 0; col < gridWidth; col++) {
        
        if (row + col == 0) {

            // Handle Top left cell
            tableRow.appendChild(document.createElement("th"));

        } else if (row == 0) {

            // Create Vertical Headings
            var child = document.createElement("th");
            child.innerHTML = colHeaders[col];
            tableRow.appendChild(child);

        } else if (col == 0) {

            // Create Horizontal Headings
            var child = document.createElement("th");
            child.innerHTML = rowHeaders[row];
            tableRow.append(child);

        } else {
            // Create Inner Cells
            // Each inner cell input tag has an id "row col"
            

            var input = document.createElement("input");
            input.setAttribute("type", "button");
            input.setAttribute("onClick", "showSelectionOverlay(" + row + ", " + col + ")");
            input.classList.add("tableButton");
            
            var data = document.createElement("td");

            data.appendChild(input);

            tableRow.appendChild(data);
        }

    }   
    
    inputTable.appendChild(tableRow);
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


// Filter the CSV data by type or generation
function getFilteredData(data, filter) {
    var output;

    // If there is no filter at all, don't bother filtering
    if(Object.keys(filter).length == 0) {
        return data;
    }

    output = data.filter(function(row) {
        
        // If there is a type filter, then use it, else all types are allowed
        var typeMatch = (filter.type == null ? true : row.type_1 == filter.type || row.type_2 == filter.type);

        // If there is a gen filter, then use it, else all gens are allowed
        var genMatch = (filter.gen == null ? true : row.gen == filter.gen);

        return typeMatch && genMatch;

    });

    return output;
}


// Searches the current filtered list of pokemon by hiding the elemnts that do not match the search query
function searchSelectionTable() {

    // Get all table row elements that are the list of pokemon in the overlay
    var tableData = document.getElementsByClassName("tableData");

    // Go through all table elements
    for(var i = 0; i < tableData.length; i++) {

        // Compare the name attribute with the search query
        if(tableData[i].getAttribute("name").search(selectionSearchBar.value) != -1) {
            
            // The name matches, show it
            tableData[i].classList.remove("disabled");

        } else {

            // The name does not match, hide it
            tableData[i].classList.add("disabled");

        }
    }

}

// Creates a table for selecting an individual pokemon out of the list
// Puts the table in outputDiv
function createSelectionTable(data) {

    // Clear the outputDiv
    selectionTable.innerHTML = "";

    for (var i = 0; i < data.length; i++) {

        var row = document.createElement("tr");
        row.setAttribute("name", data[i].identifier);
        row.setAttribute("dex", data[i].dex_number);
        row.classList.add("tableData");

        row.onclick = function() {
            console.log("click");
        }

        var nameTag = document.createElement("p");
        nameTag.innerHTML = data[i].identifier;

        var imageTag = document.createElement("img");
        imageTag.setAttribute("src", imagesLocation + data[i].file_name);

        var tableData = document.createElement("td");

        tableData.appendChild(nameTag);
        tableData.appendChild(imageTag);

        row.appendChild(tableData);

        selectionTable.appendChild(row);
    }


}



function hideOverlay() {
    overlayDiv.classList.add("disabled");

    // Clear search bar contents
    selectionSearchBar.value = "";
}

function showOverlay() {
    overlayDiv.classList.remove("disabled");

    // Set focus to search bar
    selectionSearchBar.focus();
}

// Shows the selection overlay
// The valid items to select are based on the row and column's category
function showSelectionOverlay(row, col) {
    var filteredData = getFilteredData(data, getFilterFromPos(row,col));
    createSelectionTable(filteredData);
    showOverlay();
}

// Set Events

submitButton.onclick = function() {
    renderImage();
}

// Set up overlay click event
// Only close the overlay if the background (and not the content of the menu) is clicked
overlayDiv.onmousedown = function(event) {
    if (event.target.id == "overlay") {
        hideOverlay();
    }
}

selectionSearchBar.onkeyup = function () {
    searchSelectionTable();
}