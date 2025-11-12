// file: src/components/BucketIcon.tsx

import React from "react";

interface BucketIconProps {
  bucketAmount: number;
}

const BucketIcon: React.FC<BucketIconProps> = ({ bucketAmount }) => {
  const bucketPercentage = bucketAmount;

  const fillColor =
    bucketPercentage >= 75
      ? "#f43f5e"
      : bucketPercentage >= 40
      ? "#fbbf24"
      : "#10b981";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox="0 0 120 120"
        className="h-16 w-16"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="bucket-clip">
            <path d="M20 15 L35 100 C36 110 84 110 85 100 L100 15 Z" />
          </clipPath>
        </defs>
        <path
          d="M20 15 L35 100 C36 110 84 110 85 100 L100 15 Z"
          fill="none"
          stroke="#cbd5f5"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <g clipPath="url(#bucket-clip)">
          <rect
            x="20"
            y={120 - bucketPercentage}
            width="80"
            height={bucketPercentage}
            fill={fillColor}
            opacity="0.85"
          />
        </g>
        <path
          d="M20 15 Q60 5 100 15"
          fill="none"
          stroke="#cbd5f5"
          strokeWidth="8"
        />
      </svg>
      <span className="text-sm font-semibold text-slate-600">
        {bucketPercentage}%
      </span>
    </div>
  );
};

export default BucketIcon;
