import { FC } from "react";

interface IconArrowDownProps {
  className?: string;
  fill?: boolean;
  onClick?: any;
}

const IconArrowDown: FC<IconArrowDownProps> = ({
  className,
  fill,
  onClick = false,
}) => {
  return (
    <>
      {!fill ? (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <path
            d="M7 10L12 15L17 10"
            stroke="#000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <path
            d="M7 10L12 15L17 10"
            fill="#000"
            stroke="#000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  );
};

export default IconArrowDown;
