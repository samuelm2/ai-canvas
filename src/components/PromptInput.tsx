'use client';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function PromptInput({ 
  value,
  onChange, 
  placeholder = "Describe the image you want to generate...",
  className = ""
}: PromptInputProps) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`input-field ${className}`}
    />
  );
} 