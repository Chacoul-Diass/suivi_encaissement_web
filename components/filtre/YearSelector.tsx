import React, { useState, useRef, useEffect } from "react";
import Dropdown from "../dropdown";
import IconCaretDown from "../icon/icon-caret-down";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

interface YearSelectorProps {
  selectedYears: number[];
  onChange: (years: number[]) => void;
}

const YearSelector: React.FC<YearSelectorProps> = ({
  selectedYears,
  onChange,
}) => {
  const currentYear = new Date().getFullYear();
  const startYear = 2010;
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  ).reverse();

  const toggleYear = (year: number) => {
    const newSelectedYears = selectedYears.includes(year)
      ? selectedYears.filter((y) => y !== year)
      : [...selectedYears, year].sort((a, b) => a - b);
    onChange(newSelectedYears);
  };

  return (
    <div className="relative">
      {selectedYears.length > 0 && (
        <Tippy
          content={
            <div className="p-2">
              {selectedYears.map((year) => (
                <div key={year} className="text-sm whitespace-nowrap">
                  {year}
                </div>
              ))}
            </div>
          }
          placement="top"
          arrow={true}
          interactive={true}
        >
          <div className="absolute right-[-10px] top-[-10px] z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
            {selectedYears.length}
          </div>
        </Tippy>
      )}
      <Dropdown
        btnClassName={`w-full px-3 py-2 text-left transition-all duration-200 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 ${
          selectedYears.length > 0 ? "ring-2 ring-primary/30" : ""
        }`}
        button={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Années
              </span>
            </div>
            <IconCaretDown className="w-4 h-4 text-gray-500" />
          </div>
        }
      >
        <div className="p-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="max-h-[250px] overflow-y-auto">
            <div className="space-y-0.5">
              {years.map((year) => (
                <label
                  key={year}
                  className="flex items-center px-3 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    checked={selectedYears.includes(year)}
                    onChange={() => toggleYear(year)}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                    {year}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Dropdown>
    </div>
  );
};

export default YearSelector;
