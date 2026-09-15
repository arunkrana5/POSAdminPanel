import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, MenuItem, Switch, FormControlLabel
} from '@mui/material';

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FormFieldDef {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'switch' | 'textarea';
  placeholder?: string;
  options?: FieldOption[];
  required?: boolean;
  defaultValue?: any;
  gridSpan?: number;
}

interface GenericFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FormFieldDef[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export const GenericFormModal: React.FC<GenericFormModalProps> = ({
  open,
  onClose,
  title,
  fields,
  initialValues = {},
  onSubmit,
  submitLabel = 'Save Record',
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (open) {
      const defaults: Record<string, any> = {};
      fields.forEach((f) => {
        defaults[f.name] = initialValues[f.name] !== undefined
          ? initialValues[f.name]
          : f.defaultValue !== undefined
          ? f.defaultValue
          : f.type === 'switch'
          ? false
          : '';
      });
      setFormData(defaults);
    }
  }, [open, initialValues, fields]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '10px' } }}>
      <form onSubmit={handleSubmit}>
        <DialogTitle fontWeight="800" fontSize="1.1rem" color="#0F172A" sx={{ pb: 1, borderBottom: '1px solid #E2E8F0' }}>
          {title}
        </DialogTitle>

        <DialogContent dividers sx={{ py: 2.5 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            {fields.map((field) => {
              const val = formData[field.name] !== undefined ? formData[field.name] : '';

              if (field.type === 'switch') {
                return (
                  <FormControlLabel
                    key={field.name}
                    control={
                      <Switch
                        checked={Boolean(val)}
                        onChange={(e) => handleChange(field.name, e.target.checked)}
                        color="success"
                      />
                    }
                    label={field.label}
                    sx={{ fontWeight: 600 }}
                  />
                );
              }

              if (field.type === 'select') {
                return (
                  <TextField
                    key={field.name}
                    select
                    fullWidth
                    label={field.label}
                    value={val}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    size="small"
                  >
                    {(field.options || []).map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              }

              return (
                <TextField
                  key={field.name}
                  fullWidth
                  multiline={field.type === 'textarea'}
                  rows={field.type === 'textarea' ? 3 : 1}
                  type={field.type === 'number' ? 'number' : 'text'}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={val}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  size="small"
                />
              );
            })}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          <Button onClick={onClose} disabled={isSubmitting} sx={{ fontWeight: 600, color: '#64748B' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ fontWeight: 700, px: 3, py: 0.8, borderRadius: '6px' }}
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
