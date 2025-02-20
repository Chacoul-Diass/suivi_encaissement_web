import React from "react";

const IconBuildingStore = ({ className = "h-4 w-4" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 21l18 0" />
      <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1" />
      <path d="M3 7l18 0" />
      <path d="M3 7l0 -4l18 0l0 4" />
      <path d="M9 21v-8a3 3 0 0 1 6 0v8" />
    </svg>
  );
};

export default IconBuildingStore;
