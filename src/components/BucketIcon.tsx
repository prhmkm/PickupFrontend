// file: src/components/BucketIcon.tsx

import React from "react";
import { Box, CircularProgress, CircularProgressLabel } from "@chakra-ui/react";

interface BucketIconProps {
  bucketAmount: number;
}

const BucketIcon: React.FC<BucketIconProps> = ({ bucketAmount }) => {
  const bucketPercentage = Math.max(
    Math.min(((bucketAmount - 0) / (100 - 0)) * 100, 100),
    0
  );

  const getColor = () => {
    if (bucketPercentage >= 75) return "red.400";
    if (bucketPercentage >= 25) return "yellow.400";
    return "green.400";
  };

  // طراحی جدید برای سطل
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <CircularProgress value={bucketPercentage} color={getColor()} size="50px">
        <CircularProgressLabel color={"black"}>
          {bucketPercentage}%
        </CircularProgressLabel>
      </CircularProgress>
    </Box>
  );
};

export default BucketIcon;
