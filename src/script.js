
// Image pixel measurements
const boxLength = 98;
const borderSize = 1;

const gridWidth = 23;
const gridHeight = 10;

const templateLocation = "/resources/template modified.png";
const image = document.getElementById("mainImage");
const tableDiv = document.getElementById("tableDiv");

const colHeaders = 
["", "Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poision",
 "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark",
 "Steel", "Fairy", "Starter", "Mega", "Legend", "Favorite"];

const rowHeaders =
["", "I", "II", "III", "IV", "V", "VI", "VII", "VII", "Favorite"]

// Starts top left at (0,0)
// Gives top left pixel coordinate of box [x,y]
function coordToPixel(x, y) {
    // Total length from borders
    var borderX = x * borderSize + 1;
    var borderY = y * borderSize + 1;

    // Total Length from boxes
    var boxX = x * boxLength;
    var boxY = y * boxLength;

    var xCoord = borderX + boxX;
    var yCoord = borderY + boxY;

    if ( x < 0 || x >= gridWidth) {
        xCoord = 1;
    }

    if (y < 0 || y >= gridHeight) {
        yCoord = 1;
    }
    return [xCoord, yCoord];
}

/*
var xVal = 0;

// TODO XY Coord to image map in images?
images = [ {src: image.src} ];

function render() {

    console.log("rendering");

    var coords = coordToPixel(xVal, 0);
    images.push({ src:'/ignore/test.png', x: coords[0], y: coords[1]});
    xVal++;


    mergeImages(images).then(b64 => image.src = b64);
}

*/

// Initialize tableDiv
tableOutput = "<table>\n";

// Create Headings

// Create rest of table
for(row = 0; row < gridHeight; row++) {
    tableOutput += "<tr>\n";
    for(col = 0; col < gridWidth; col++) {

        if (row + col == 0) {
            tableOutput += "<th></th>";
        } else if (row == 0) {
            tableOutput += "<th>" + colHeaders[col] + "</th>";
        } else if (col == 0) {
            tableOutput += "<th>" + rowHeaders[row] + "</th>";
        } else {
            tableOutput += "<td><input type=\"text\" class=\"content\"></td>";
        }

        /*
        // Row and Col 0 are headers
        if( row == 0 || col == 0) {

            // If row + col == 0, then the position is 0,0. Ignore
            if (row + col != 0) {
                tableOutput += "<th>Testtttttt</th>";
            } else {
                tableOutput += "<th></th>";
            }

        } else {
            tableOutput += "<td><input type=\"text\" class=\"content\"></td>";
        }
        */
        
    }   
    tableOutput += "</tr>\n";
}
tableOutput += "</table>";
tableDiv.innerHTML = tableOutput;



