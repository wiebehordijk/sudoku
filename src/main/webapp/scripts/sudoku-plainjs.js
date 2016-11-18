"use strict";

// A Field represents a box at a given position in a Sudoku puzzle with possibly a value filled in,
// and a set of available numbers that can still be filled in.
// The parameter 'given' means that the value was given from the start.
var Field = function(row, col, value, available, given) {
    this.row = row;
    this.col = col;
    this.value = value || null;
    this.available = available || [1,2,3,4,5,6,7,8,9];
    this.given = given || false;
};

// A field is filled in when it has a value
Field.prototype.isFilledIn = function() {
    return !!this.value;
};

// Returns a field equal to this, but with one less available value
Field.prototype.without = function(n) {
    const available = this.available.filter( function(v) {
        return v !== n;
    } );
    return new Field(this.row, this.col, this.value, available, this.given);
};

// Returns a field equal to this, but with a value filled in
Field.prototype.fillIn = function(n, given) {
    return new Field(this.row, this.col, n, [n], given);
};

// Returns the field's value as a string, or else an empty string
Field.prototype.toString = function() {
    if (this.value === null) return "";
    else return "" + this.value;
};

// Fields are related if they are on the same row, column or in the same 3x3 square
Field.prototype.related = function(that) {
    if (that.constructor != Field) return false;
    if (this.row === that.row) return true;
    if (this.col === that.col) return true;
    if ((Math.floor(this.row / 3) === Math.floor(that.row / 3)) &&
        (Math.floor(this.col / 3) === Math.floor(that.col / 3))) return true;
    return false;
};

// Returns whether the fields are at the same position
Field.prototype.samePos = function(that) {
    if (that.constructor != Field) return false;
    return ((this.row === that.row) && (this.col === that.col));
};


// A Matrix represents a Sudoku puzzle, consisting of Fields
var Matrix = function(fields) {
    this.fields = fields;
};

// Returns an empty matrix, that is, a matrix with empty fields
Matrix.prototype.empty = function() {
    var fields = [];
    for (var row = 0; row < 9; row++) {
        for (var col = 0; col < 9; col++) {
            fields[row * 9 + col] = new Field(row, col);
        }
    }
    return new Matrix(fields);
};

// Turns a string with one line per row, columns separated by pipe symbols, into a matrix
Matrix.prototype.fromStringWithPipes = function(string) {
    var matrix = Matrix.prototype.empty();
    const lines = string.split("\n");
    lines.forEach(function(line, row) {
        const vals = line.split("|");
        vals.forEach(function(val, col) {
            var value = null;
            if (val !== " ") {
                value = Number(val);
                matrix = matrix.fillInGiven(new Field(row, col, value));
            }
        });
    });
    return matrix;
};

// Turns a matrix into a string with one line per row, columns separated by pipe symbols
Matrix.prototype.toString = function() {
    var result = "";
    for (var row = 0; row < 9; row++) {
        for (var col = 0; col < 9; col++) {
            const field = this.field(row, col);
            if (field.isFilledIn()) result += field.value;
            else result += " ";
            if (col < 8) result += "|";
        }
        if (row < 8) result += "\n";
    }
    return result;
};

// Returns the field at the given position
Matrix.prototype.field = function(row, col) {
    if ((row < 0) || (row > 8) || (col < 0) || (col > 8))
        throw new Error("row and col must be between 0 and 8");
    return this.fields[row * 9 + col];
};

// Returns a matrix equal to this, but with one field filled in.
// The value filled in becomes unavailable in all related fields.
Matrix.prototype.fillIn = function(field, value, given) {
    const newFields = this.fields.map(function(f) {
        if (field.samePos(f)) return f.fillIn(value, given);
        else if (field.related(f)) return f.without(value);
        else return f;
    });
    return new Matrix(newFields);
};

// During search, fields are filled in with the parameter 'given' set to false
Matrix.prototype.fillInSearch = function(field, value) {
    return this.fillIn(field, value, false);
};

// When setting up the initial matrix, fields with a given value have 'given' set to true
Matrix.prototype.fillInGiven = function(field) {
    return this.fillIn(field, field.value, true);
};

// A matrix is a solution when every field is filled in
Matrix.prototype.isSolution = function() {
    return this.fields.every(function(f) { return f.isFilledIn(); });
};

// A matrix is a dead end when there is a field without any available values to fill in
Matrix.prototype.isDeadEnd = function() {
    return this.fields.some(function(f) { return f.available.length === 0; });
};


// Helper function for the problem solving algorithm. For every search step, we expand the search space
// by filling in an available value in one of the fields. If a field has fewer available values, then
// filling in a value for that field will lead to a solution faster than doing so for a field with many
// available values. This function finds the field with the least available values that is not filled in.
function fieldWithLeastAvailableValues(matrix) {
    var leastField = null;
    var leastAvailable = 9;
    matrix.fields.forEach(function(field) {
        if (!field.isFilledIn()) {
            if (field.available.length < leastAvailable || leastField === null) {
                leastField = field;
                leastAvailable = field.available.length;
                if (leastAvailable === 1) return field;
            }
        }
    });
    return leastField;
}

// Solver function. This function recurses depth-first through the search space. For a matrix that is
// not a solution or a dead end, it takes the field with the smallest number of available values, and
// tries filling in every available value in that field, and recurses into the matrix yielded by
// filling in that value. The function yields every step, and when a solution is found, it yields the solution.
// When no solution is found, the function returns null.
function* solve(matrix) {
    if (matrix.isSolution()) yield {"matrix": matrix, "field" : null, "value" : null, "solution" : true};
    else if (matrix.isDeadEnd()) return null;
    else {
        const field = fieldWithLeastAvailableValues(matrix);
        if (field === null) return null;
        for (const value of field.available) {
            const newMatrix = matrix.fillInSearch(field, value);
            yield {"matrix": matrix, "field" : field, "value" : value, "solution" : false};
            yield* solve(newMatrix);
        }
    }
}


// From here on we have functions that operate on the web page.

// Turns a table with input values into a matrix
function inputToMatrix() {
    var matrix = Matrix.prototype.empty();
    for (var row = 0; row < 9; row++) {
        for (var col = 0; col < 9; col++) {
            var cell = document.getElementById("cell" + (row * 9 + col));
            // Do not take intermediate solution values as given
            if (cell.classList.contains("given")) {
                try {
                    var value = parseInt(cell.value);
                    if (value) matrix = matrix.fillInGiven(new Field(row, col, value));
                }
                catch(err) {
                    console.log(err.message);
                }
            }
        }
    }
    return matrix;
}

// Shows a matrix in the table
function showMatrix(matrix) {
    for (var row = 0; row < 9; row++) {
        for (var col = 0; col < 9; col++) {
            var cell = document.getElementById("cell" + (row * 9 + col));
            cell.value = matrix.field(row, col).value;
            cell.classList.remove("step");
            if (matrix.field(row, col).given) cell.classList.add("given");
            else cell.classList.remove("given");
        }
    }
}

// Shows an error message. Type can be 'success' or 'error'.
function showMessage(message, type) {
    const text = document.getElementById(type + "Text");
    text.innerText = message;
    text.style.display = "block";
}

// Clears any error/success messages
function clearMessage(type) {
    const text = document.getElementById(type + "Text");
    text.innerText = "";
    text.style.display = "none";
}

// Shows an intermediate step
function showStep(matrix, field, value) {
    showMatrix(matrix);
    var cell = document.getElementById("cell" + (field.row * 9 + field.col));
    cell.value = value;
    cell.classList.add("step");
}

// Advances the solution process by one step, shows the step, and shows an error or the solution if found
function solveStep(solver, timer) {
    var next = solver.next();
    if (next.done) {      // No solution found
        showMessage("No solution found", "error");
        clearInterval(timer);
    }
    else if (next.value.solution) {
        showMessage("Solution found!", "success");
        clearInterval(timer);
    }
    else {
        showStep(next.value.matrix, next.value.field, next.value.value);
    }
}

function getDelay() {
    const delaySelector = document.getElementById("delay");
    return Number(delaySelector.value);
}

function startSolve(e) {
    e.preventDefault();
    clearMessage("error");
    clearMessage("success");
    const matrix = inputToMatrix();
    const solver = solve(matrix);
    const timer = setInterval(function() {
        solveStep(solver, timer);
    }, getDelay());
    document.getElementById("stopBtn").addEventListener("click", function(e) {
        clearInterval(timer);
    });
}

// Makes sure a cell only has one digit, and has the class 'given' when a number is filled in
function guardInput(cell) {
    if (cell.value == "") {
        cell.classList.remove("given");
    }
    else {
        if (cell.value.length > 1)
            cell.value = cell.value.substring(0, 1);
        const num = Number(cell.value);
        if (isNaN(num)) {
            cell.value = "";
            cell.classList.remove("given");
        }
        else {
            cell.classList.add("given");
        }
    }
}


// Test puzzles
var testPuzzles = {
"testPuzzle1" : "5| |1| |2| | | | \n7| |8|4|6|9|5|3|1\n4|6| | | | | | |8\n |5| | | | |6|9|4\n | | |6| |4| |5| \n |9| |3| |7|1|8| \n2|1|5|8|7| |9| | \n | |3|9|4|6| | |5\n9|4| |2| |5|8| |3",
"testPuzzle2" : " | |8| |9| |1|4|5\n7| |2| | | | | | \n | |5| |3| | | | \n3| | | | |9|4| | \n | | | |5| |3| |7\n | | | | | | |2| \n | |6|2| | | | | \n | | | |1|4|9| | \n |1| | | | | |7| ",
"testPuzzle3" : "5| |1| |2| | |4| \n7| |8|4|6|9|5|3|1\n4|6| | | | | | |8\n |5| | | | |6|9|4\n | | |6| |4| |5| \n |9| |3| |7|1|8| \n2|1|5|8|7| |9| | \n | |3|9|4|6| | |5\n9|4| |2| |5|8| |3",
"testPuzzle4" : " | |8| |9| |1|4|5\n7| |2| | | | | | \n | |5| |3| | | | \n3| | | | |9|4| | \n | | | |5| |3| | \n | | | | | | |2| \n | |6|2| | | | | \n | | | |1|4|9| | \n |1| | | | | |7| ",
"testPuzzle5" : " | | | |2| | |4|9\n1|2| | | |9| | | \n5| | |7| |6| | | \n8|7|1| | | | | | \n6| | | |9| |8| | \n | |5| | | | | |2\n | |7|3| | | | |4\n | | | |5| | |6| \n9| | | |6| | | |8"
};


// Page initialization

for (var i = 1; i <= 5; i++) {
    const id = "testPuzzle" + i;
    document.getElementById(id).addEventListener("click", function(e) {
        e.preventDefault();
        const matrix = Matrix.prototype.fromStringWithPipes(testPuzzles[id]);
        showMatrix(matrix);
    });
}

for (var i = 0; i < 9*9; i++) {
    const cell = document.getElementById("cell" + i);
    cell.addEventListener("input", function(e) {
        guardInput(cell);
    });
}

document.getElementById("submitBtn").addEventListener("click", startSolve);
