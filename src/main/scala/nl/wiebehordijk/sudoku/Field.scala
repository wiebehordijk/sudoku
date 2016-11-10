package nl.wiebehordijk.sudoku

/**
  * Class that represents a field in a Sudoku
  * @param row Row number in the matrix, 0 is top
  * @param col Column number in the matrix, 0 is left
  * @param filledIn Optional number that is filled in in the field
  * @param available The set of numbers that can still be entered in the field
  */
case class Field(row: Int, col: Int, filledIn: Option[Int] = None, available: Set[Int] = (1 to 9).toSet, given: Boolean = false) {

  def without(n: Int): Field = Field(row, col, filledIn, available - n, given)

  def isFilledIn: Boolean = filledIn.isDefined

  def fillIn(n: Int, given: Boolean = false): Field = Field(row, col, Some(n), Set(n), given)

  override def toString: String = filledIn match {
    case None => ""
    case Some(i) => i toString
  }

  /**
    * Checks if two fields are either on the same row, col or 3x3 square
    */
  def related(that: Field): Boolean = {
    if (row == that.row) true
    else if (col == that.col) true
    else (row / 3 == that.row / 3) && (col / 3 == that.col / 3)
  }

  /**
    * Equals is redefined as having the same row and column
    */
  override def equals(obj: scala.Any): Boolean = obj match {
    case that: Field => row == that.row && col == that.col
    case _ => false
  }
}
