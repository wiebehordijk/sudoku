package nl.wiebehordijk

import javax.servlet.ServletContext

/**
  * Created by Wiebe on 26-10-2016.
  */
package object sudokuweb {

  val SudokuSize = 9

  def puzzleFromFile(name: String, context: ServletContext): Option[String] = {
    val stream = context.getResourceAsStream("/WEB-INF/resources/" + name + ".txt")
    if (stream == null) None else Some(io.Source.fromInputStream(stream).mkString)
  }
}
