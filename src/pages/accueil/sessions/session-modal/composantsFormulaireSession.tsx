import { Button, FormControl } from '@mui/material';
import React from 'react';
import { TextField } from '@mui/material';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export function SessionChampTexte(
    { label, value, onChange, error, name }: { label: string; value: string; onChange: (v: string) => void; error?: string | null; name: string }
) {
    return (
        <FormControl fullWidth variant="outlined">
            <TextField
                label={label}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                error={!!error}
                helperText={error || ""}
                name={name}
            />
        </FormControl>
    );
}

export function SessionChampDate(
    { label, value, name, onChange, error }: { label: string; value: string; name: string; onChange: (v: string) => void; error?: string | null; }
) {
    return (
        <FormControl fullWidth variant="outlined">
            <DatePicker label={label} name={name} openTo="year" views={['year']}value={value ? dayjs(`${value}-01-01`) : null} 
                onChange={(newValue: Dayjs | null) => {
                    if (newValue){
                        onChange(newValue.year().toString());
                    }
                }}
                slotProps={{
                    textField: {
                        error: !!error,
                        helperText: error || "",
                    },
                }}
                minDate={dayjs()}
            />
        </FormControl>
    );
}

export function SessionModalBouton(
    { label, loading, disabled, startIcon, endIcon, outlined, onClick }: { label: string; loading?: boolean; disabled?: boolean; startIcon?: React.ReactNode; endIcon?: React.ReactNode; padding?: string; outlined?: boolean; onClick?: () => void }
) {
    return (
        <Button type={onClick ? "button" : "submit"} variant={outlined ? "outlined" : "contained"} size="medium" color="primary"
            sx={{padding: 1}} startIcon={startIcon} endIcon={endIcon} disabled={disabled || loading}
            loading={loading} disableElevation onClick={onClick}
        >
            {label}
        </Button>
    );
}
