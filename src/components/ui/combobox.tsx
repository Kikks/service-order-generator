import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  id?: string;
  className?: string;
}

export function Combobox({
  value,
  onChange,
  suggestions,
  placeholder,
  id,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = React.useState<
    string[]
  >([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (value.length > 0) {
      const filtered = suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredSuggestions(filtered);
      setOpen(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setOpen(false);
    }
  }, [value, suggestions]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (value.length > 0 && filteredSuggestions.length > 0) {
            setOpen(true);
          }
        }}
      />
      {open && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
        >
          <div className="p-1">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                onClick={() => handleSelect(suggestion)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === suggestion ? "opacity-100" : "opacity-0",
                  )}
                />
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
