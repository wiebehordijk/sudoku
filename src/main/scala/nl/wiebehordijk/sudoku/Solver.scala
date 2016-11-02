package nl.wiebehordijk.sudoku

/**
  * Contains the search logic to find a set of solutions for a given puzzle.
  */
object Solver {

  /**
    * Gives one of the fields that has not been filled in, and that has the lowest number of
    * available values that can still be filled in. This is used to reduce the search space quickly.
    */
  def fieldWithLeastAvailableValues(m: Matrix): Option[Field] = {
    val sorted = m.fields.sortBy(_.available.size)
    sorted.find(!_.isFilledIn)
  }

  /**
    * Recursive function that searches the search space depth-first and gives a stream of all solutions.
    * @param m The initial matrix
    * @return Stream of all solutions
    */
  def solve(m: Matrix): Stream[Matrix] = {
      if (m.isSolution) Stream(m)
      else if (m.isDeadEnd) Stream()
      else fieldWithLeastAvailableValues(m) match {
        case None => Stream()
        case Some(field) =>
          field.available.toStream flatMap(i => solve(m.fillIn(field, i)))
      }
  }

}
