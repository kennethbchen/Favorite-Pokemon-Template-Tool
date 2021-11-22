"use strict";

// Image pixel measurements
const boxLength = 98;
const borderSize = 1;

const gridWidth = 23;
const gridHeight = 10;

const testImageLocation = "/ignore/test2.png";
const templateLocation = "/resources/template modified.png";

// In ignore folder for testing
const imagesLocation = "/ignore/all/";

var tableDiv = $("#tableDiv");
const mainImageTag = $("#mainImage");

var table;

const colHeaders = 
["", "Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poision",
 "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark",
 "Steel", "Fairy", "Starter", "Mega", "Legend", "Favorite"];

const rowHeaders =
["", "I (1)", "II (2)", "III (3)", "IV (4)", "V (5)", "VI (6)", "VII (7)", "VII (8)", "Favorite"]

// Initialize tableDiv
tableDiv.append($("<table>").attr("id", "mainTable"));

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
            var input = $("<input>").attr("type", "text").attr("class", "content").attr("id", row + " " + col);
            data.append(input);
            tableRow.append(data);
        }

        
        
    }   
    $("#mainTable").append(tableRow);
}


// Starts top left at (0,0)
// Gives top left pixel coordinate of box [x,y]
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


table = document.getElementById("mainTable");

// Returns a 2 dimensional list of all cell values in the input table ([row][column])
function getCellValues() {
    var output = [];

    // Row and Col start as 1 because we want to skip the headers
    for (var row = 1; row < table.rows.length; row++) {
        var outputRow = [];

        for (var col = 1; col < table.rows[row].cells.length; col++) {

            // Every cell accessed is an <input> tag
            // Each input tag has an id "row col"
            var element = document.getElementById(row + " " + col);
            outputRow.push(element.value);
           
        }

        output.push(outputRow);
    }

    return output;
}

// https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

// Takes an input string representing a Pokemon and translates that to the corresponding image
/*  
    ------ Image File Rules ------

    [] - Required
    () - Optional
    [Dex Number]_(form id)_(m/f)_(g/n)
    variant id (0->...) - Regional variants, Megas, or other. Default 0
    m/f - Male / Female form.
    g/n - Form Gigantimax / Normal. Default Normal

    // TODO: Alcremie is a special case
    // TODO: Consolidate form and variant id?

    For Example: 
    6_2_n.png

    ------ Example input ------
    38 -> (Translated to 38_0_n)
    6_2_n
    6_0_g

    TODO: hopefully selection system instead of text input
    TODO: maybe better image naming system
*/
function getImagePathFromInput(input) {
    var values = input.split("_");

    var dexNumber = -1;
    var formID = 0;
    var gender = "";
    var form = "_n";

    for(var i = 0; i < values.length; i++) {

        // Assign each value
        if (isNumeric(values[i])){

            if (dexNumber == -1) {
                // The first number is always interpreted as the dex number
                dexNumber = parseInt(values[i]);
            } else {
                // Every number after that sets formID
                formID = parseInt(values[i]);
            }
        } else {

            switch(values[i]) {
                case ("g"): // Gigantimax / Normal
                case ("n"):
                form = "_" + values[i];
                break;
                case ("m"): // Male / Female
                case ("f"):
                gender = "_" + values[i];
                break;
            }
        }

    }

    return imagesLocation + dexNumber + "_" + formID + gender + form + ".png";

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

                // Todo, translation between table data and image
                imageData.push({src: getImagePathFromInput(tableData[row][col]), x: coordinates[0], y: coordinates[1]});
            }
        }
    }

    mergeImages(imageData).then(b64 => mainImageTag.attr("src", b64));
}