// Image pixel measurements
const boxLength = 98;
const borderSize = 1;

const gridWidth = 23;
const gridHeight = 10;

const testImageLocation = "/ignore/test2.png";
const templateLocation = "/resources/template modified.png";

const tableDiv = document.getElementById("tableDiv");
const mainImageTag = document.getElementById("mainImage");

var table;

const colHeaders = 
["", "Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poision",
 "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark",
 "Steel", "Fairy", "Starter", "Mega", "Legend", "Favorite"];

const rowHeaders =
["", "I", "II", "III", "IV", "V", "VI", "VII", "VII", "Favorite"]

// Initialize tableDiv
tableOutput = "<table id=\"mainTable\">\n";

// Create rest of table
for(row = 0; row < gridHeight; row++) {
    tableOutput += "<tr>\n";
    for(col = 0; col < gridWidth; col++) {

        if (row + col == 0) {
            // Handle Top left cell
            tableOutput += "<th></th>";
        } else if (row == 0) {
            // Create Vertical Headings
            tableOutput += "<th>" + colHeaders[col] + "</th>";
        } else if (col == 0) {
            // Create Horizontal Headings
            tableOutput += "<th>" + rowHeaders[row] + "</th>";
        } else {
            // Create Inner Cells
            // Each inner cell input tag has an id "row col"
            tableOutput += "<td><input type=\"text\" class=\"content\" id=\"" + row + " " + col + "\" ></td>";
        }
        
    }   
    tableOutput += "</tr>\n";
}
tableOutput += "</table>";
tableDiv.innerHTML = tableOutput;

table = document.getElementById("mainTable");


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
                coordinates = coordToPixel(row + 1, col + 1);

                // Todo, translation between table data and image
                imageData.push({src: testImageLocation, x: coordinates[0], y: coordinates[1]});
            }
        }
    }

    mergeImages(imageData).then(b64 => mainImageTag.src = b64);
}