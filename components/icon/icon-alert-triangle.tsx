import { SVGProps } from "react";

const IconAlertTriangle = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M3 13a9 9 0 0 1 9 -9a9 9 0 0 1 9 9a9 9 0 0 1 -9 9a9 9 0 0 1 -9 -9" />
    </svg>
  );
};

export default IconAlertTriangle;
