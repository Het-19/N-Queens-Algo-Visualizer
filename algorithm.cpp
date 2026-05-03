#include <string>
#include <utility>
#include <vector>
using namespace std;


// Reverts every cell this queen actually modified (queen square + attacks written).
void revertQueenMarks(vector<vector<int>>& board,
                      const vector<pair<int, int>>& modifiedCells) {
    for (const auto& cell : modifiedCells) {
        board[cell.first][cell.second] = 0;
    }
}


// Marks queen at (row,col) as 100*queenNum; marks attacked empties as queenNum only if still 0.
// Records each cell whose value was changed so backtracking touches only those entries.
void placeQueenMarkAttacks(int n, int row, int col, int queenNum,
                           vector<vector<int>>& board,
                           vector<pair<int, int>>& outModifiedCells) {
    outModifiedCells.clear();

    board[row][col] = 100 * queenNum;
    outModifiedCells.emplace_back(row, col);
    
    // Lambda function to consider attacking a cell.
    auto considerAttackCell = [&](int r, int c) {
        // Skip the queen's own cell as it is already marked above.
        if (r == row && c == col) {
            return;
        }
        // If the cell is empty, mark it with the queen number.
        if (board[r][c] == 0) {
            board[r][c] = queenNum;
            outModifiedCells.emplace_back(r, c);
        }
    };

    // Consider attacking all cells in the same row, column, and diagonals.
    for (int j = 0; j < n; ++j) {
        considerAttackCell(row, j);
    }
    for (int i = 0; i < n; ++i) {
        considerAttackCell(i, col);
    }
    for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; --i, --j) {
        considerAttackCell(i, j);
    }
    for (int i = row - 1, j = col + 1; i >= 0 && j < n; --i, ++j) {
        considerAttackCell(i, j);
    }
    for (int i = row + 1, j = col - 1; i < n && j >= 0; ++i, --j) {
        considerAttackCell(i, j);
    }
    for (int i = row + 1, j = col + 1; i < n && j < n; ++i, ++j) {
        considerAttackCell(i, j);
    }
}

void getNQueens(int n, int row, vector<vector<int>>& board, vector<int>& queenCol,
                vector<vector<string>>& ans,
                vector<vector<pair<int, int>>>& attackedCellsPerQueen) {
    if (row == n) {
        vector<string> solution(n, string(n, '.'));
        for (int i = 0; i < n; ++i) {
            solution[i][queenCol[i]] = 'Q';
        }
        ans.push_back(solution);
        return;
    }

    const int queenNum = row + 1;

    for (int col = 0; col < n; ++col) {
        // Safe iff unattacked empty cell (no overlap with queen markers 100*k).
        if (board[row][col] == 0) {
            placeQueenMarkAttacks(n, row, col, queenNum, board, attackedCellsPerQueen[row]);
            queenCol[row] = col;

            getNQueens(n, row + 1, board, queenCol, ans, attackedCellsPerQueen);

            revertQueenMarks(board, attackedCellsPerQueen[row]);
        }
    }
}


vector<vector<string>> solveNQueens(int n) {
    vector<vector<int>> board(n, vector<int>(n, 0));
    vector<int> queenCol(n, -1);
    vector<vector<string>> ans;
    vector<vector<pair<int, int>>> attackedCellsPerQueen(n);

    for (auto& bucket : attackedCellsPerQueen) {
        bucket.reserve(static_cast<size_t>(6 * n));
    }

    getNQueens(n, 0, board, queenCol, ans, attackedCellsPerQueen);
    return ans;
}