import { FC } from "react";

interface IconWarningProps {
  className?: string;
}

const IconWarning: FC<IconWarningProps> = ({ className }) => {
  return (
    <svg
      width="100"
      height="105"
      viewBox="0 0 279 286"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.4526 103L113.086 258.25C124.826 278.583 154.174 278.583 165.914 258.25L255.547 103C267.287 82.6667 252.613 57.25 229.134 57.25L49.8664 57.25C26.3875 57.25 11.7131 82.6667 23.4526 103Z"
        stroke="#C7493D "
        stroke-width="20"
      />
      <rect
        x="127.477"
        y="96.207"
        width="24.4526"
        height="86.5862"
        rx="12.2263"
        fill="#C7493D "
      />
      <circle cx="139.905" cy="198.828" r="10.8233" fill="#C7493D " />
    </svg>
  );
};

export default IconWarning;
