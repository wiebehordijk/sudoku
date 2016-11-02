name := "Sudoku"

version := "0.1"

scalaVersion := "2.11.8"

libraryDependencies += "junit" % "junit" % "4.11" % "test"
libraryDependencies += "org.scalatest" %% "scalatest" % "3.0.0" % "test"
libraryDependencies += "org.scalatra.scalate" %% "scalate-core" % "1.7.0"

scalacOptions ++= Seq("-language:postfixOps")

enablePlugins(JavaAppPackaging)
