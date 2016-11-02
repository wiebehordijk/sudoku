import nl.wiebehordijk.sudoku.test.TestData
import nl.wiebehordijk.sudoku.{Matrix, Solver}

val data = new TestData {

}

val m4 = Matrix fromStringWithPipes data.puzzle4
val solStream = Solver.solve(m4)
solStream.isEmpty
solStream.head
solStream.tail
solStream.take(50).length

val m5 = Matrix fromStringWithPipes data.puzzle5
val s5 = Solver.solve(m5)
s5.take(2).size
solStream.head(0,2).given
