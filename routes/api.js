'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

let solver = new SudokuSolver();

module.exports = function(app) {

  app.route('/api/check').post((req, res) => {
    const { puzzle, coordinate, value } = req.body;
    if (!puzzle || !coordinate || !value) {
      return res.json({ error: "Required field(s) missing" });
    }
    const row = coordinate.split("")[0];
    const column = coordinate.split("")[1];
    if (
      coordinate.length !== 2 ||
      !/[a-i]/i.test(row) ||
      !/[1-9]/i.test(column)
    ) {
      res.json({ error: "Invalid coordinate" });
      return;
    }
    if (!/[1-9]/i.test(value) || value > 9 || value < 1) {
      res.json({ error: "Invalid value" });
      return;
    }
    if (puzzle.length != 81) {
      res.json({ error: "Expected puzzle to be 81 characters long" });
      return;
    }
    if (/[^0-9.]/g.test(puzzle)) {
      res.json({ error: "Invalid characters in puzzle" });
      return;
    }

    let validCol = solver.checkColPlacement(puzzle, row, column, value);
    let validReg = solver.checkRegionPlacement(puzzle, row, column, value);
    let validRow = solver.checkRowPlacement(puzzle, row, column, value);
    let conflicts = [];
    if (validCol && validReg && validRow) {
      res.send({ valid: true });
    } else {
      if (!validRow) {
        conflicts.push("row");
      }
      if (!validCol) {
        conflicts.push("column");
      }
      if (!validReg) {
        conflicts.push("region");
      }
      res.send({ valid: false, conflict: conflicts })
    }
  });

  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body;
      if (!puzzle) {
        return res.json({ error: "Required field missing" });
      }
      if (puzzle.length != 81) {
        return res.json({ error: 'Expected puzzle to be 81 characters long' });
      }
      if (/[^0-9.]/g.test(puzzle)) {
        return res.json({ error: 'Invalid characters in puzzle' });
      }
      let solvedString = solver.solve(puzzle);
      if (!solvedString) {
        res.json({ error: "Puzzle cannot be solved" });
      } else {
        res.json({ solution: solvedString });
      }
    });
};
