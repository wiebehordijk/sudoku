package nl.wiebehordijk.sudoku

/**
  * Represents a matrix of fields, that is, a Sudoku puzzle
  */
abstract class Matrix() {

  val fields: Seq[Field]

  /**
    * Gives a matrix with the given value filled in at the position of the given field.
    * All related fields are updated to fields for which the given value is no longer available.
    * @param field Identifies the position where the new value is entered
    * @param v The new value
    * @param given Flag that indicates a given value, so they can be highlighted in the solution
    */
  private def fillIn(field: Field, v: Int, given: Boolean): Matrix =
  {
    val newFields = fields.map { f =>
      if (f == field) f fillIn(v, given)
      else if (f.related(field)) f without v
      else f
    }
    Matrix withFields newFields
  }

  /**
    * Gives a matrix with the given value filled in at the position of the given field.
    * All related fields are updated to fields for which the given value is no longer available.
    * The field is considered to be filled in as part of the solution, so given is false.
    * @param field Identifies the position where the new value is entered
    * @param v The new value
    */
  def fillIn(field: Field, v: Int) : Matrix = fillIn(field, v, given = false)

  /**
    * Gives a matrix with the given value filled in at the position of the given field.
    * All related fields are updated to fields for which the given value is no longer available.
    * The field is considered to be filled in as part of the puzzle, so given is true.
    * @param field Identifies the position where the new value is entered and its new value
    */
  def fillInGiven(field: Field): Matrix = fillIn(field, field.filledIn.get, given = true)

  /**
    * Gives the value of the field at the given coordinates.
    * Fails with a NoSuchElementException if the coordinates are outside the matrix.
    */
  def apply(row: Int, col: Int): Field = {
    if (row < 0 || row > 8 || col < 0 || col > 8) throw new IllegalArgumentException
    else fields(row * 9 + col)
  }

  /**
    * A matrix is a valid solution if all the fields have been filled in
    */
  def isSolution: Boolean = fields.forall(_.isFilledIn)

  /**
    * A matrix is a dead end if one of the fields has no available values to fill in
    * @return
    */
  def isDeadEnd: Boolean = fields.exists(_.available.isEmpty)


  /**
    * Represents the matrix as a string with lines, with pipe symbols between the columns
    */
  override def toString: String = "\n" + {
    Matrix.SRange map { row =>
      Matrix.SRange map { col =>
        apply(row, col).filledIn match {
          case Some(value) => value toString
          case None => " "
        }
      } mkString "|"
    } mkString "\n"
  }
}


object Matrix {

  val SRange = 0 until 9

  val empty: Matrix = {
    val fields = for {
      row <- SRange
      col <- SRange
    } yield Field(row, col, None, (1 to 9).toSet)
    withFields(fields)
  }

  private def withFields(theFields: Seq[Field]): Matrix = {
    new Matrix {
      val fields = theFields
    }
  }

  /**
    * Takes a Seq of Fields and fills in every value, updating related fields to make the value unavailable to them
    * @return Matrix with the given fields
    */
  def fromSeq(fields: Seq[Field]): Matrix = {
    fields.foldLeft[Matrix](empty) { (m: Matrix, f: Field) =>
      if (f.filledIn.isDefined) m.fillInGiven(f)
      else m
    }
  }

  /**
    * Takes a string representation and turns it into a Matrix
    * @param s String where the rows are separated by newlines and the columns by pipe symbols, the fields
    *          have a single digit or a space for empty fields
    * @return The matrix with the given fields
    */
  def fromStringWithPipes(s: String): Matrix = {
    val lines = s.split('\n')
    val fields = for {
      row <- lines.indices
      vals = lines(row).split('|')
      col <- vals.indices
      (available, filledIn) =
        if (vals(col).trim == "") ((1 to 9).toSet, None)
        else {
          val v = vals(col).trim.toInt
          (Set(v), Some(v))
        }
    } yield Field(row, col, filledIn, available)

    fromSeq(fields)
  }
}