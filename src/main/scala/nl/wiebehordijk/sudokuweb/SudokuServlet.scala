package nl.wiebehordijk.sudokuweb

import org.scalatra._
import nl.wiebehordijk.sudoku._

class SudokuServlet extends SudokuStack {

  get("/") {
    contentType = "text/html"

    params.get("example") match {
      case None => ssp("/sudoku")
      case Some(puzzleName) => {
        puzzleFromFile(puzzleName, this.context) match {
          case None => ssp("/sudoku", "error" -> ("Example with name " + puzzleName + " not found"))
          case Some(puzzleString) => {
            val example = Matrix.fromStringWithPipes(puzzleString)
            ssp("/sudoku", "example" -> example)
          }
        }
      }
    }
  }

  get("/solve") {
    contentType = "text/html"

    val matrix = paramsToMatrix(params)
    val solutions = Solver.solve(matrix)
    solutions match {
      case Stream.Empty => ssp("/solve", "none" -> true)
      case first #:: Stream.Empty => ssp("/solve", "solution" -> first)
      case first #:: second #:: tail  => ssp("/solve", "solution" -> first, "multiple" -> true)
    }
  }

  def paramsToMatrix(params: Params): Matrix = {
    val inputSeq = for (i <- 0 until 9 * 9) yield {
      val field = new Field(i / 9, i % 9)
      try {
        val param = params("cell" + i)
        param match {
          case "" => field
          case s => field fillIn s.toInt
        }
      } catch {
        case _: NumberFormatException => field
        case _: NoSuchElementException => field
      }
    }

    Matrix.fromSeq(inputSeq)
  }
}
