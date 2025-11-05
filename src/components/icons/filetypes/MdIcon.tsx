import React from 'react';

const MdIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M10.44 15.32a1.25 1.25 0 0 0 1.12 1.68h1.44a1.25 1.25 0 0 0 1.12-1.68l-2-4.32-2 4.32z" />
    <path d="M8 17h.01" />
  </svg>
);

export default MdIcon;