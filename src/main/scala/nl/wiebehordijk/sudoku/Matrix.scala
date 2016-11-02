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

  def fillIn(field: Field, v: Int) : Matrix = fillIn(field, v, false)

  def fillIn(row: Int, col: Int, v: Int): Matrix = fillIn(Field(row, col, None, Set()), v, false)

  def fillInGiven(field: Field): Matrix = fillIn(field, field.filledIn.get, true)

  /**
    * Gives the value of the field at the given coordinates.
    * Fails with a NoSuchElementException if the coordinates are outside the matrix.
    * @param row
    * @param col
    * @return
    */
  def apply(row: Int, col: Int): Field = {
    fields.find(f => f.row == row && f.col == col).get
  }

  def isSolution: Boolean = fields.forall(_.isFilledIn)

  def isDeadEnd: Boolean = fields.exists(_.available.isEmpty)


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

  def fromSeq(fields: Seq[Field]): Matrix = {
    fields.foldLeft[Matrix](empty) { (m: Matrix, f: Field) =>
      if (f.filledIn.isDefined) m.fillInGiven(f)
      else m
    }
  }

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