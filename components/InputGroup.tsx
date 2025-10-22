import React from 'react';

interface InputGroupProps {
    label: string;
    id: string;
    type: 'text' | 'number' | 'textarea' | 'select';
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    placeholder?: string;
    required?: boolean;
    min?: number;
    options?: { value: string; label: string }[];
}

const InputGroup: React.FC<InputGroupProps> = ({ label, id, type, value, onChange, placeholder, required = false, min, options = [] }) => {
    const commonProps = {
        id,
        name: id,
        value,
        onChange,
        required,
        className: "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
    };

    const renderInput = () => {
        switch (type) {
            case 'textarea':
                return <textarea {...commonProps} placeholder={placeholder} rows={3} />;
            case 'select':
                return (
                    <select {...commonProps}>
                        {options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            case 'number':
                 return <input type={type} {...commonProps} placeholder={placeholder} min={min} />;
            case 'text':
            default:
                return <input type="text" {...commonProps} placeholder={placeholder} />;
        }
    };

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-700">
                {label}
            </label>
            {renderInput()}
        </div>
    );
};

export default InputGroup;