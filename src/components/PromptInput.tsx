'use client';

/**
 * Props for the PromptInput component
 * 
 * @interface PromptInputProps
 * @property {string} value - The current value of the input field
 * @property {function} onChange - Callback function called when the input value changes
 * @property {string} [placeholder] - Optional placeholder text for the input field
 * @property {string} [className] - Optional additional CSS class names
 */
interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * PromptInput - Text input field for AI image generation prompts
 * 
 * @param {PromptInputProps} props - Component props
 * @returns {JSX.Element} A styled text input field for entering prompts
 * 
 * @description A controlled input component specifically designed for entering
 * AI image generation prompts. It provides a clean, styled interface with
 * customizable placeholder text and CSS classes.
 * 
 * @example
 * <PromptInput
 *   value={currentPrompt}
 *   onChange={(newPrompt) => setCurrentPrompt(newPrompt)}
 *   placeholder="Describe the image you want to generate..."
 *   className="my-custom-class"
 * />
 */
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