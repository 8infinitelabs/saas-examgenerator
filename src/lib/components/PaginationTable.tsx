//@ts-ignore
import React from 'react';
import { Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TablePagination } from '@mui/material';

export const PaginationTable = ({ columns, rows, totalRows, pageSize, page, handlePageChane, handlePageSizeChange }: any) => {

  return (
    <>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              {columns.map((c: any, i: number) =>
                <TableCell key={i} style={c.style}><strong>{c.name}</strong></TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r: any, i: number) =>
              <TableRow key={i}>
                {columns.map((c: any, k: number) =>
                  <TableCell key={k}>{r[c.field]}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 20, 50, 100]}
        component="div"
        count={totalRows}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={handlePageChane}
        onRowsPerPageChange={handlePageSizeChange}
      />
    </>
  )
}
