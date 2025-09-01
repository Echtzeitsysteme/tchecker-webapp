import { useState } from 'react';
import { TextField, Chip, Box, Fab } from '@mui/material';
import { KeyboardEvent } from 'react';
import { Add } from '@mui/icons-material';

interface StringListInputProps {
    label: string;
    onChange?: (items: string[]) => void;
    value?: string[];
}


const StringListInput: React.FC<StringListInputProps> = (props: StringListInputProps) => {
    const [input, setInput] = useState('');
    const [items, setItems] = useState<string[]>([]);

    const handleAdd = () => {
        if (input.trim() !== '' && !items.includes(input.trim())) {
            setItems([...items, input.trim()]);
            setInput('');
            props.onChange?.([...items, input.trim()]);
        }
    };

    const handleDelete = (itemToDelete: string) => {
        setItems(items.filter((item) => item !== itemToDelete));
        props.onChange?.(items.filter((item) => item !== itemToDelete));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '8px', maxWidth: '400px', alignItems: 'center' }}>
                <TextField
                    label={props.label}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    fullWidth
                />
                <div>
                    <Fab onClick={handleAdd} color="primary">
                        <Add/>
                    </Fab>
                </div>
            </div>

            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {items.map((item, index) => (
                    <Chip
                        key={index}
                        label={item}
                        onDelete={() => handleDelete(item)}
                        color="primary"
                    />
                ))}
            </Box>
        </div>
    );
}

export default StringListInput;
