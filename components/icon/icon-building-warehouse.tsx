import { SVGProps } from "react";

const IconBuildingWarehouse = (props: SVGProps<SVGSVGElement>) => {
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
      <path d="M3 21v-13l9-4l9 4v13" />
      <path d="M13 13h4v8h-4" />
      <path d="M13 13v8" />
      <path d="M7 13v8" />
      <path d="M7 13h4v8h-4" />
    </svg>
  );
};

export default IconBuildingWarehouse;
