import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./select.module.css";
export type SelectOption = {
  label: string;
  value: string | number;
};

type SingleSelectProps = {
  multiple?: false;
  onChange: (value: SelectOption | undefined) => void;
  value?: SelectOption;
};

type MultipleSelectProps = {
  multiple: true;
  onChange: (value: SelectOption[]) => void;
  value: SelectOption[];
};

type SelectProps = {
  options: SelectOption[];
} & (SingleSelectProps | MultipleSelectProps);

const Select = ({ multiple, value, onChange, options }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const clearOptions = () => {
    multiple ? onChange([]) : onChange(undefined);
  };

  //memoisation to prevent re-rendering
  const selectOption = useCallback(
    (option: SelectOption) => {
      if (multiple) {
        if (value.includes(option)) {
          onChange(value.filter((o) => o !== option));
        } else {
          onChange([...value, option]);
        }
      } else {
        if (option !== value) onChange(option);
      }
    },
    [multiple, value, onChange]
  );

  const isOptionSelected = (option: SelectOption) => {
    return multiple ? value.includes(option) : option === value;
  };

  // Effect to set the highlighted index to 0 when the dropdown is opened
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  // Effect to handle keyboard events
  useEffect(() => {
    const container = containerRef.current;
    const handler = (e: KeyboardEvent) => {
      if (e.target != container) return;

      switch (e.code) {
        case "Enter":
        case "Space":
          setIsOpen((prev) => !prev);
          if (isOpen) selectOption(options[highlightedIndex]);
          break;

        case "ArrowUp":
        case "ArrowDown": {
          if (!isOpen) {
            setIsOpen(true);
            break;
          }
          const newValue = highlightedIndex + (e.code === "ArrowDown" ? 1 : -1);
          if (newValue >= 0 && newValue < options.length) {
            setHighlightedIndex(newValue);
          }
          break;
        }
        case "Escape":
          setIsOpen(false);
          break;
      }
    };

    container?.addEventListener("keydown", handler);
    return () => {
      container?.removeEventListener("keydown", handler);
    };
  }, [isOpen, highlightedIndex, options, selectOption]);

  return (
    <div
      ref={containerRef}
      onBlur={() => setIsOpen(false)}
      onClick={() => setIsOpen((prev) => !prev)}
      tabIndex={0}
      className={styles.container}
    >
      <span className={styles.value}>
        {multiple
          ? value.map((v) => (
              <button
                className={styles["option-badge"]}
                key={v.value}
                onClick={(e) => {
                  e.stopPropagation();
                  selectOption(v);
                }}
              >
                {v.label}
                <span className={styles["remove-btn"]}>&times;</span>
              </button>
            ))
          : value?.label}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          clearOptions();
        }}
        className={styles["clear-btn"]}
      >
        &times;
      </button>
      <div className={styles.divider}></div>
      <div className={styles.caret}></div>
      <ul className={`${styles.options} ${isOpen ? styles.show : ""}`}>
        {options.map((option, index) => (
          <li
            className={`${styles.option} ${
              isOptionSelected(option) ? styles.selected : ""
            } ${index === highlightedIndex ? styles.highlighted : ""}`}
            key={option.value}
            onClick={(e) => {
              e.stopPropagation();
              selectOption(option);
              setIsOpen(false);
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Select;
