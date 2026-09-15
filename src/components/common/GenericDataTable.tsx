import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, Typography, IconButton, Tooltip, TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { StatusBadge } from './StatusBadge';

export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
}

interface GenericDataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  rowsPerPageDefault?: number;
}

export function GenericDataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
  emptyMessage = 'No records found in database.',
  rowsPerPageDefault = 10,
}: GenericDataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageDefault);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const hasActions = Boolean(onEdit || onDelete || onView);

  return (
    <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align || 'left'}
                  style={{ width: col.width }}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.725rem',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    py: 1.5,
                  }}
                >
                  {col.header}
                </TableCell>
              ))}
              {hasActions && (
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.725rem',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    py: 1.5,
                    pr: 3,
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight="600">
                    Loading records from API...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight="500">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => {
                const rowKey = keyExtractor(row);
                return (
                  <TableRow
                    key={rowKey}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {columns.map((col) => {
                      const value = row[col.key];

                      return (
                        <TableCell key={col.key} align={col.align || 'left'} sx={{ py: 1.5, fontSize: '0.825rem' }}>
                          {col.render ? (
                            col.render(row)
                          ) : col.key.toLowerCase().includes('status') ? (
                            <StatusBadge status={String(value || '')} />
                          ) : (
                            String(value !== undefined && value !== null ? value : '-')
                          )}
                        </TableCell>
                      );
                    })}

                    {hasActions && (
                      <TableCell align="right" sx={{ py: 1, pr: 2 }}>
                        <Box display="flex" justifyContent="flex-end" gap={0.5}>
                          {onView && (
                            <Tooltip title="View Details">
                              <IconButton size="small" color="info" onClick={() => onView(row)}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onEdit && (
                            <Tooltip title="Edit Record">
                              <IconButton size="small" color="primary" onClick={() => onEdit(row)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onDelete && (
                            <Tooltip title="Delete Record">
                              <IconButton size="small" color="error" onClick={() => onDelete(row)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ borderTop: '1px solid #E2E8F0', bgcolor: '#FAF5FF' }}
      />
    </Paper>
  );
}
