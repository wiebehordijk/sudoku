window.onload = function() { init() };


function init() {
//    initTable();
    var submit = document.getElementById("submitBtn");
    submit.onclick = function() {
        alert(packTable());
    }
}

function initTable() {
    var table = document.getElementById("sudokuTable");

    for (i = 0; i < 9; i++) {
        var row = table.insertRow(i);
        for (j = 0; j < 9; j++) {
            var cell = row.insertCell(j);
            var input = document.createElement("input");
            input.type = "number";
            input.id = "cell" + (i * 9 + j);
            input.size = 1;
            input.min = 1;
            input.max = 9;
            input.oninput = function() {
                if (this.value.length > 1) this.value = this.value.slice(0, 1);
                if (!this.value.match(/^[0-9]$/)) this.value = "";
            }
            cell.appendChild(input);
        }
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