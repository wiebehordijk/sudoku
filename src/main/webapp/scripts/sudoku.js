window.onload = function() { init() };


function init() {
    var submit = document.getElementById("submitBtn");
    submit.onclick = function() {
        alert("Going to solve the puzzle");
    }
}

function packTable() {
    var table = document.getElementById("sudokuTable");
    var tableString = "";

    for (i = 0; i < 9 * 9; i++) {
        var input = document.getElementById("cell" + i);
        if (input.value) tableString += input.value;
        else tableString += ".";
    }

    return tableString;
}