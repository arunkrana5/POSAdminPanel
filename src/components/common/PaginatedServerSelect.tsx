import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, TextField, Button, Popover, List, ListItemButton,
  ListItemText, Typography, CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';

export interface PaginatedServerSelectProps<T> {
  label: string;
  value: any;
  onChange: (value: any, item?: T) => void;
  fetchOptions: (params: { page: number; pageSize: number; search: string; parentFilter?: any }) => Promise<{
    items: T[];
    hasMore: boolean;
    totalCount: number;
  }>;
  itemLabel?: (item: T) => string;
  itemValue?: (item: T) => any;
  itemSubtitle?: (item: T) => string;
  parentFilter?: any;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  allowClear?: boolean;
  selectedDisplayLabel?: string;
  size?: 'small' | 'medium';
}

export function PaginatedServerSelect<T extends Record<string, any>>({
  label,
  value,
  onChange,
  fetchOptions,
  itemLabel = (item: any) => item?.name || item?.label || item?.title || String(item?.id ?? item),
  itemValue = (item: any) => item?.id ?? item?.value ?? item,
  itemSubtitle,
  parentFilter,
  required = false,
  disabled = false,
  placeholder,
  allowClear = true,
  selectedDisplayLabel,
  size = 'small',
}: PaginatedServerSelectProps<T>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [items, setItems] = useState<T[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRequestIdRef = useRef(0);
  const open = Boolean(anchorEl);

  const loadInitial = useCallback(async (searchTerm = search) => {
    const requestId = ++searchRequestIdRef.current;
    setIsLoading(true);
    setError(null);
    setPage(1);

    try {
      const res = await fetchOptions({
        page: 1,
        pageSize: 5,
        search: searchTerm,
        parentFilter,
      });
      if (requestId === searchRequestIdRef.current) {
        setItems(res.items || []);
        setHasMore(res.hasMore || false);
      }
    } catch (err: any) {
      if (requestId === searchRequestIdRef.current) {
        setError(err?.message || 'Failed to load options');
      }
    } finally {
      if (requestId === searchRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchOptions, parentFilter, search]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const res = await fetchOptions({
        page: nextPage,
        pageSize: 5,
        search,
        parentFilter,
      });

      setItems((prev) => {
        const existingIds = new Set(prev.map((i) => String(itemValue(i))));
        const newItems = (res.items || []).filter((i) => !existingIds.has(String(itemValue(i))));
        return [...prev, ...newItems];
      });
      setPage(nextPage);
      setHasMore(res.hasMore || false);
    } catch (_) {
      // Keep existing items on error
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      loadInitial(val);
    }, 350);
  };

  useEffect(() => {
    // Reset when parent filter changes
    setItems([]);
    setPage(1);
    setSearch('');
  }, [parentFilter]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    setAnchorEl(event.currentTarget);
    loadInitial('');
  };

  const handleClose = () => {
    setAnchorEl(null);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  };

  // Find label of selected item
  const selectedItem = items.find((i) => String(itemValue(i)) === String(value));
  const displayText = selectedItem
    ? itemLabel(selectedItem)
    : selectedDisplayLabel || (value ? `Selected #${value}` : '');

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        fullWidth
        size={size}
        label={label + (required ? ' *' : '')}
        value={displayText}
        placeholder={placeholder || `Select ${label}...`}
        onClick={handleOpen}
        disabled={disabled}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              {allowClear && value && !disabled && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(null, undefined);
                  }}
                  sx={{ mr: -0.5 }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
              <ExpandMoreIcon sx={{ cursor: disabled ? 'default' : 'pointer' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          cursor: disabled ? 'default' : 'pointer',
          '& .MuiInputBase-input': { cursor: disabled ? 'default' : 'pointer' },
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            width: anchorEl ? anchorEl.clientWidth : 320,
            maxHeight: 380,
            display: 'flex',
            flexDirection: 'column',
            p: 1.5,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            borderRadius: '10px',
          },
        }}
      >
        <TextField
          size="small"
          autoFocus
          fullWidth
          placeholder={`Search ${label}...`}
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearch('');
                    loadInitial('');
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ mb: 1 }}
        />

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4} gap={1}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Loading options...
              </Typography>
            </Box>
          ) : error ? (
            <Box textAlign="center" py={3}>
              <Typography variant="body2" color="error" mb={1}>
                {error}
              </Typography>
              <Button size="small" startIcon={<RefreshIcon />} onClick={() => loadInitial()}>
                Retry
              </Button>
            </Box>
          ) : items.length === 0 ? (
            <Box textAlign="center" py={3}>
              <Typography variant="body2" color="text.secondary">
                No matching options found.
              </Typography>
            </Box>
          ) : (
            <List dense disablePadding>
              {items.map((item) => {
                const val = itemValue(item);
                const isSelected = String(val) === String(value);

                return (
                  <ListItemButton
                    key={String(val)}
                    selected={isSelected}
                    onClick={() => {
                      onChange(val, item);
                      handleClose();
                    }}
                    sx={{
                      borderRadius: '6px',
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: '#EDE9FE',
                        fontWeight: 700,
                        '&:hover': { backgroundColor: '#DDD6FE' },
                      },
                    }}
                  >
                    <ListItemText
                      primary={itemLabel(item)}
                      secondary={itemSubtitle ? itemSubtitle(item) : undefined}
                      primaryTypographyProps={{
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? '#6D28D9' : 'text.primary',
                      }}
                      secondaryTypographyProps={{ fontSize: '0.725rem' }}
                    />
                  </ListItemButton>
                );
              })}

              {hasMore && (
                <Box textAlign="center" pt={1} pb={0.5}>
                  {isLoadingMore ? (
                    <CircularProgress size={18} />
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      onClick={loadMore}
                      sx={{ textTransform: 'none', fontSize: '0.75rem', borderColor: '#DDD6FE', color: '#6D28D9' }}
                    >
                      Show More (+5 options)
                    </Button>
                  )}
                </Box>
              )}
            </List>
          )}
        </Box>
      </Popover>
    </Box>
  );
}
