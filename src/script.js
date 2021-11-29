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

// ------------------------------------

// Div containing the menu overlay. Essentially the background of the overlay
const overlayDiv = document.getElementById("overlay");

// Div containing the actual content of the menu overlay.
const overlayContent = document.getElementById("overlayContent");

// ------------------------------------

// Div that contains all selection menu related elements
const selectionOverlayDiv = document.getElementById("selectionOverlayContent");

const selectionHeader = document.getElementById("selectionHeader");

// The input field that is used to search in the overlay menu
const selectionSearchBar = document.getElementById("selectionSearchBar");

// Div that contains all selection items
const selectionDiv = document.getElementById("selectionDiv");


// ------------------------------------

// Div that contains all output menu related elements
const outputOverlayDiv = document.getElementById("outputOverlayContent");

// The main image that is displayed
const mainOutputImage = document.getElementById("mainOutputImage");

// ------------------------------------


// Column headers of the table
const colHeaders = 
["", "Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison",
 "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark",
 "Steel", "Fairy", "Starter", "Mega", "Legend", "Favorite"];

 // Row Headers of the table
const rowHeaders =
["", "1", "2", "3", "4", "5", "6", "7", "8", "Favorite"];

// Array containing CSV data from dataLocation
// Array of javascript objects
var csvData;

// 2D array containing the user's selected images for each cell
// Each image is the image name as a string
var selectionData = [];

// ------------------------------------

// Get and parse CSV data
var request = new XMLHttpRequest();
request.onreadystatechange = function() {
    if(request.readyState == XMLHttpRequest.DONE) {
        csvData = d3.csvParse(request.responseText);
        
        // Once the csv data is loaded, all of the image file paths are known
        // Preload all images
        for(var i = 0; i < csvData.length; i++) {
            var newImg = new Image();
            newImg.src = imagesLocation + csvData[i].file_name;
        }
    }
}
request.open("get", dataLocation, true);
request.send();


// Create rest of table
for(var element = 0; element < gridHeight; element++) {
    var tableRow = document.createElement("tr");

    for(var col = 0; col < gridWidth; col++) {
        
        if (element + col == 0) {

            // Handle Top left cell
            tableRow.appendChild(document.createElement("th"));

        } else if (element == 0) {

            // Create Vertical Headings
            var child = document.createElement("th");
            child.innerHTML = colHeaders[col];
            tableRow.appendChild(child);

        } else if (col == 0) {

            // Create Horizontal Headings
            var child = document.createElement("th");
            child.innerHTML = rowHeaders[element];
            tableRow.append(child);

        } else {
            // Create Inner Cells
            // Each inner cell input tag has an id "row col"
            

            var input = document.createElement("input");
            input.setAttribute("type", "button");
            input.setAttribute("onClick", "showSelectionOverlay(" + element + ", " + col + ")");
            input.classList.add("tableButton");
            
            var csvData = document.createElement("td");

            csvData.appendChild(input);

            tableRow.appendChild(csvData);
        }

    }   
    
    inputTable.appendChild(tableRow);
}

// Initalize selectionData based on the dimensions of the input table
// Row and Col start as 1 because we want to skip the headers
for (var element = 1; element < inputTable.rows.length; element++) {
    var newRow = [];

    for (var col = 1; col < inputTable.rows[element].cells.length; col++) {
        
        newRow.push("");
       
    }

    selectionData.push(newRow);
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

// Takes the input values from the data and renders the final image
function renderImage() {

    var imageData = [];

    // Add the base template
    imageData.push({src: templateLocation, x: 0, y:0});

    // Add images based on the table data
    for(var row = 0; row < selectionData.length; row++) {
        for (var col = 0; col < selectionData[row].length; col++) {

            if (selectionData[row][col] !== "") {

                // row and col are incremented because the table data doesn't include the headers
                // So to properly get the coordinates, the headers need to be taken into account
                var coordinates = coordToPixel(row + 1, col + 1);

                // Todo, use selections based on filtered CSV input
                imageData.push({src: imagesLocation + selectionData[row][col], x: coordinates[0], y: coordinates[1]});
            }
        }
    }

    mergeImages(imageData).then(b64 => mainOutputImage.setAttribute("src", b64));
    showOutputOverlayContent();
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
function searchSelection() {

    // Get all elements that are the selection items
    var selectionItem = document.getElementsByClassName("selectionItem");

    // Go through all table elements
    for(var i = 0; i < selectionItem.length; i++) {

        // Compare the name attribute with the search query
        if(selectionItem[i].getAttribute("name").search(selectionSearchBar.value) != -1) {
            
            // The name matches, show it
            selectionItem[i].classList.remove("disabled");

        } else {

            // The name does not match, hide it
            selectionItem[i].classList.add("disabled");

        }
    }

}

// Creates a grid for selecting an individual pokemon out of the list
// selectionCallback is called when a selection is actually made by the user
function createSelectionGrid(data, selectionCallback) {

    // Clear the outputDiv
    selectionDiv.innerHTML = "";

    for (var i = 0; i < data.length; i++) {

        var item = document.createElement("div");
        item.setAttribute("name", data[i].identifier);
        item.setAttribute("dex", data[i].dex_number);
        item.classList.add("selectionItem");

        // https://medium.com/@leonardobrunolima/javascript-tips-common-mistake-using-closures-35d7b55f5380
        let filePath = data[i].file_name;
        item.onclick = function() {
            selectionCallback(filePath);
        };

        var nameTag = document.createElement("p");
        nameTag.innerHTML = data[i].identifier;

        var imageTag = document.createElement("img");
        imageTag.setAttribute("src", imagesLocation + data[i].file_name);

        item.appendChild(nameTag);
        item.appendChild(imageTag);

        selectionDiv.appendChild(item);
    }


}

function hideOverlay() {
    overlayDiv.classList.add("disabled");
    
}

function showOverlay() {
    overlayDiv.classList.remove("disabled");
       
}

// TODO: implement showing specific overlay content way better
function showSelectionOverlayContent() {

    // Show the overlay content
    selectionOverlayDiv.classList.remove("disabled");

    // Hide the other overlay content
    outputOverlayDiv.classList.add("disabled");
    
    // Scroll is needed
    overlayContent.classList.add("scroll");

    // Show the whole menu overlay
    showOverlay();

    // Clear search bar contents
    selectionSearchBar.value = "";

    // Set focus to search bar
    selectionSearchBar.focus();
}

function showOutputOverlayContent() {

    // Show the overlay content
    outputOverlayDiv.classList.remove("disabled");

    // Hide the other overlay content
    selectionOverlayDiv.classList.add("disabled");

    // Scroll is not needed
    overlayContent.classList.remove("scroll");

    // Show the whole menu overlay
    showOverlay();
}

// Shows the selection overlay
// The valid items to select are based on the row and column's category
function showSelectionOverlay(row, col) {
    var filteredData = getFilteredData(csvData, getFilterFromPos(row,col));

    // Set the header to indicate the filter
    var header = "";

    // The favorite row does not need "Gen "
    header += (row == gridHeight-1 ? "" : "Gen ");

    // Add Gen and Type
    header += rowHeaders[row] + " " + colHeaders[col];

    // Only the 18 types need "Type" in the header
    header += (col <= 18 ? " Type" : "");

    // Special case for bottom right corner
    header = (row == gridHeight-1 && col == gridWidth-1 ? "All Time Favorite" : header);
    
    
    selectionHeader.innerHTML = header;

    createSelectionGrid(filteredData, function(fileName) {

        // row and col are decremented by because they include the header
        // selecitonData does not include headers so one row and one col is ignored
        selectionData[row - 1][col - 1] = fileName;
        hideOverlay();
    });

    showSelectionOverlayContent();
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
    searchSelection();
}

function printSelectionData(){
    console.log(selectionData);
}