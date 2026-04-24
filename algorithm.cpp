    // Marks or unmarks all cells attacked by a queen placed at (row, col).
    // delta = +1 when placing a queen, -1 when removing (backtracking).
    void updateBoard(int n, int row, int col, vector<vector<int>>& board, int delta) {

        // Mark / unmark the entire row
        for (int j = 0; j < n; j++)
            board[row][j] += delta;

        // Mark / unmark the entire column
        for (int i = 0; i < n; i++)
            board[i][col] += delta;

        // Mark / unmark upper-left diagonal
        for (int i = row, j = col; i >= 0 && j >= 0; i--, j--)
            board[i][j] += delta;

        // Mark / unmark upper-right diagonal
        for (int i = row, j = col; i >= 0 && j < n; i--, j++)
            board[i][j] += delta;

        // Mark / unmark lower-left diagonal
        for (int i = row, j = col; i < n && j >= 0; i++, j--)
            board[i][j] += delta;

        // Mark / unmark lower-right diagonal
        for (int i = row, j = col; i < n && j < n; i++, j++)
            board[i][j] += delta;

        // The queen's own cell is counted 3 times (row + col + two diagonals cross here).
        // Correct the over-count so that the cell itself reflects exactly the net attacks.
        // After a +1 pass it becomes +3 (row, col, diag all hit it); we want +1 → adjust by -2*delta.
        board[row][col] += -2 * delta;
    }

    // Converts the int matrix (tracks attack counts) to a vector<string> board
    // by checking which cell in each row holds the queen (value == 0 after removal isn't enough;
    // we track queen positions via a separate colPos array passed from the solver).
    void getNQueens(int n, int row, vector<vector<int>>& board,
                    vector<int>& queenCol, vector<vector<string>>& ans) {

        if (row == n) {
            // Build the string board from the recorded queen column positions
            vector<string> solution(n, string(n, '.'));
            for (int i = 0; i < n; i++)
                solution[i][queenCol[i]] = 'Q';
            ans.push_back(solution);
            return;
        }

        for (int col = 0; col < n; col++) {

            // A cell is safe only if no queen attacks it (value == 0)
            if (board[row][col] == 0) {

                // Place queen: mark all attacked cells with +1
                updateBoard(n, row, col, board, +1);
                queenCol[row] = col;

                getNQueens(n, row + 1, board, queenCol, ans);

                // Remove queen: unmark all attacked cells with -1 (backtrack)
                updateBoard(n, row, col, board, -1);
            }
            // Cells with value > 0 are already under attack — skip them entirely
        }
    }

    vector<vector<string>> solveNQueens(int n) {
        // n x n integer matrix, 0 = safe, >0 = under attack
        vector<vector<int>> board(n, vector<int>(n, 0));

        // Stores the column index of the queen placed in each row
        vector<int> queenCol(n, -1);

        vector<vector<string>> ans;
        getNQueens(n, 0, board, queenCol, ans);
        return ans;
    }