package nl.wiebehordijk.sudoku.test

import nl.wiebehordijk.sudoku.{Matrix, Solver}
import org.junit.runner.RunWith
import org.scalatest.FunSuite
import org.scalatest.junit.JUnitRunner


trait TestData {
  def puzzleFromFile(path: String): String = {
    val stream = getClass.getResourceAsStream(path)
    val s = io.Source.fromInputStream(stream)
    s.mkString
  }

  val puzzle1 = puzzleFromFile("/Puzzle1.txt")
  val solution1 = puzzleFromFile("/Solution1.txt")
  val puzzle2 = puzzleFromFile("/Puzzle2.txt")
  val solution2 = puzzleFromFile("/Solution2.txt")
  val puzzle3NoSolution = puzzleFromFile("/Puzzle3NoSolution.txt")
  val puzzle4 = puzzleFromFile("/Puzzle4.txt")
  val puzzle5 = puzzleFromFile("/Puzzle5.txt")
}

/**
  * Created by Wiebe on 12-10-2016.
  */
@RunWith(classOf[JUnitRunner])
class SudokuSuite extends FunSuite {

  test("Make matrix") {
    new TestData {
      val m1 = Matrix.fromStringWithPipes(puzzle1)
      assert(!m1.isSolution, "Not a solution")
      assert(!m1.isDeadEnd, "Not a dead end")
      assert(m1(0,0).filledIn.get == 5)

      val sol = Matrix fromStringWithPipes solution1
      assert(sol.isSolution, "Solution")
      assert(!sol.isDeadEnd, "Not a dead end")
    }
  }

  test("Solver") {
    new TestData {
      val m1 = Matrix fromStringWithPipes puzzle1
      val sol1 = Matrix fromStringWithPipes solution1
      val solved1 = Solver.solve(m1)
      assert(solved1.size == 1, "Has only one solution")
      assert(solved1.head.toString == sol1.toString)

      val m2 = Matrix fromStringWithPipes puzzle2
      val sol2 = Matrix fromStringWithPipes solution2
      val solved2 = Solver.solve(m2)
      assert(solved2.size == 1, "Has only one solution")
      assert(solved2.head.toString == sol2.toString)

      val m3 = Matrix fromStringWithPipes puzzle3NoSolution
      assert(!m3.isDeadEnd, "Has no solution but is not a dead end")
      assert(Solver.solve(m3) isEmpty, "Has no solution")

      val m4 = Matrix fromStringWithPipes puzzle4
      assert(Solver.solve(m4).size == 23, "Puzzle 4 has 23 solutions")
    }
  }

  test("Solver uses streams") {
    new TestData {
      val m4 = Matrix fromStringWithPipes puzzle4
      val solStream = Solver.solve(m4)
      assert(solStream.nonEmpty, "Solution stream should not be empty")
      assert(solStream.tail.nonEmpty, "Tail should not be empty")
      assert(solStream.take(5).size == 5, "First 5 elements")
      assert(solStream.take(50).size == 23, "Total 23 elements")

      val emptySolutions = Solver.solve(Matrix.empty)
      assert(emptySolutions.nonEmpty, "Solutions of empty matrix should not be empty")
      assert(emptySolutions.take(100).size == 100, "Empty matrix has at least 100 solutions")
    }
  }
}
