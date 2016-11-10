describe("Field", function() {

    it("has some logical default values", function() {
        var field = new Field(3, 6);
        expect(field.row).toBe(3);
        expect(field.col).toBe(6);
        expect(field.value).toBeNull();
        expect(field.available).toEqual([1,2,3,4,5,6,7,8,9]);
        expect(field.given).toBe(false);
    });

    it("returns a new field when we remove an available number", function() {
        var field = new Field(3,6);
        var field1 = field.without(5);
        expect(field1.row).toBe(3);
        expect(field1.col).toBe(6);
        expect(field1.value).toBeNull();
        expect(field1.available).toEqual([1,2,3,4,6,7,8,9]); // 5 removed
        expect(field1.given).toBe(false);

        var field2 = field1.without(5);
        expect(field2.row).toBe(3);
        expect(field2.col).toBe(6);
        expect(field2.value).toBeNull();
        expect(field2.available).toEqual([1,2,3,4,6,7,8,9]); // 5 removed again
        expect(field2.given).toBe(false);
    });

    it("should return the correct value for isFilledIn", function() {
        var field = new Field(3, 6);
        expect(field.isFilledIn()).toBe(false);
        var field1 = new Field(4, 1, 8);
        expect(field1.isFilledIn()).toBe(true);
    });

    it("returns a new field when a value is filled in", function() {
        var field = new Field(2, 0);
        var field1 = field.fillIn(4, true);
        expect(field1.row).toBe(2);
        expect(field1.col).toBe(0);
        expect(field1.value).toBe(4);
        expect(field1.available).toEqual([4]);
        expect(field1.given).toBe(true);
    });

    it("is represented as an empty string when not filled in, or the value when filled in", function() {
        var f1 = new Field(7, 1);
        expect(f1.toString()).toBe("");
        var f2 = new Field(4, 0, 1);
        expect(f2.toString()).toBe("1");
    });

    it("is related to another field if they are in the same row, column or 3x3 subsquare", function() {
        var field = new Field(4, 4);
        var f1 = new Field(1, 1);
        var f2 = new Field(4, 1);
        var f3 = new Field(1, 4);
        var f4 = new Field(3, 3);
        var f5 = new Field(3, 6);
        var f6 = new Field(6, 3);
        expect(field.related(f1)).toBe(false);
        expect(field.related(f2)).toBe(true);
        expect(field.related(f3)).toBe(true);
        expect(field.related(f4)).toBe(true);
        expect(field.related(f5)).toBe(false);
        expect(field.related(f6)).toBe(false);
        expect(field.related("Hallo")).toBe(false);
    });

    it("has same pos as another field if the rows and cols are the same", function() {
        var field = new Field(5, 2);
        var f1 = new Field(0, 0);
        var f2 = new Field(5, 3);
        var f3 = new Field(8, 2);
        var f4 = new Field(5, 2, 6);
        expect(field.samePos(f1)).toBe(false);
        expect(field.samePos(f2)).toBe(false);
        expect(field.samePos(f3)).toBe(false);
        expect(field.samePos(f4)).toBe(true);
    });
});

var testPuzzle1 = "5| |1| |2| | | | \n7| |8|4|6|9|5|3|1\n4|6| | | | | | |8\n |5| | | | |6|9|4\n | | |6| |4| |5| \n |9| |3| |7|1|8| \n2|1|5|8|7| |9| | \n | |3|9|4|6| | |5\n9|4| |2| |5|8| |3";
var testSolution1 = "5|3|1|7|2|8|4|6|9\n7|2|8|4|6|9|5|3|1\n4|6|9|5|3|1|7|2|8\n3|5|7|1|8|2|6|9|4\n1|8|2|6|9|4|3|5|7\n6|9|4|3|5|7|1|8|2\n2|1|5|8|7|3|9|4|6\n8|7|3|9|4|6|2|1|5\n9|4|6|2|1|5|8|7|3";


describe("Matrix", function() {

    it("can be created empty", function() {
        var matrix = Matrix.prototype.empty();
        expect(matrix.fields.length).toBe(81);
        var field = matrix.fields[80];
        expect(field.row).toBe(8);
        expect(field.col).toBe(8);
        expect(field.isFilledIn()).toBe(false);
    });

    it("can find a field by coordinates", function() {
        var matrix = Matrix.prototype.empty();
        var field = matrix.field(1, 2);
        expect(field.row).toBe(1);
        expect(field.col).toBe(2);
    });

    it("can fill in a value in one of its fields", function() {
        var m1 = Matrix.prototype.empty();
        var f1 = new Field(3, 3, 5);
        var m2 = m1.fillInGiven(f1);
        expect(m2.field(3, 3).value).toBe(5);
        expect(m2.field(3, 3).available).toEqual([5]);
        expect(m2.field(3, 3).given).toEqual(true);
        expect(m2.field(0, 0).available).toEqual([1,2,3,4,5,6,7,8,9]);
        expect(m2.field(4, 8).available).toEqual([1,2,3,4,5,6,7,8,9]);
        expect(m2.field(0, 3).available).toEqual([1,2,3,4,6,7,8,9]);
        expect(m2.field(3, 8).available).toEqual([1,2,3,4,6,7,8,9]);
        expect(m2.field(4, 4).available).toEqual([1,2,3,4,6,7,8,9]);
    });

    it("can create itself from a string", function() {
        var m1 = Matrix.prototype.fromStringWithPipes(testPuzzle1);
        expect(m1.field(0, 0).value).toBe(5);
        expect(m1.field(8, 8).value).toBe(3);
        expect(m1.field(8, 7).available).toEqual([1,6,7]);
    });

    it("knows if it's a solution", function() {
        var m1 = Matrix.prototype.fromStringWithPipes(testPuzzle1);
        expect(m1.isSolution()).toBe(false);
        var sol1 = Matrix.prototype.fromStringWithPipes(testSolution1);
        expect(sol1.isSolution()).toBe(true);
    });

    it("knows if it's a dead end", function() {
        var m1 = Matrix.prototype.fromStringWithPipes(testPuzzle1);
        expect(m1.isDeadEnd()).toBe(false);
    });
});

describe("Solver", function() {

    it("can find the field with the least available values", function() {
        var matrix = Matrix.prototype.empty().fillInGiven(new Field(0,0,1)).fillInGiven(new Field(8,4,2)).fillInGiven(new Field(8,8,3));
        var field = fieldWithLeastAvailableValues(matrix);
        expect(field.row).toBe(8);
        expect(field.col).toBe(0);
        expect(field.isFilledIn()).toBe(false);
        expect(field.available).toEqual([4,5,6,7,8,9]);
    });

    it("can solve a puzzle with one solution", function() {
        var puzzle = Matrix.prototype.fromStringWithPipes(testPuzzle1);
        var solution = solve(puzzle);
        var testSolution = Matrix.prototype.fromStringWithPipes(testSolution1);
        expect(solution.fields.toString()).toEqual(testSolution.fields.toString());
    })
});
