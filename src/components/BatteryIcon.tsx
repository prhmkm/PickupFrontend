// file: src/components/BatteryIcon.tsx

import React from "react";
import { Box, Text } from "@chakra-ui/react";

interface BatteryIconProps {
  batteryAmount: number;
}

const BatteryIcon: React.FC<BatteryIconProps> = ({ batteryAmount }) => {
  // محاسبه درصد باتری از 3.9 (0%) تا 4.2 (100%)
  const batteryPercentage = Math.max(
    Math.min(((batteryAmount - 3.9) / (4.2 - 3.9)) * 100, 100),
    0
  );

  // انتخاب رنگ بر اساس درصد باتری
  const getColor = () => {
    if (batteryPercentage >= 80) return "green.400";
    if (batteryPercentage >= 25) return "yellow.400";
    return "red.400";
  };

  // طراحی آیکون باتری
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="40px" // ارتفاع یکسان با سایر المان‌ها
      >
        {/* مستطیل باتری */}
        <Box
          width="50px"
          height="25px"
          border="2px solid black"
          position="relative"
          borderRadius="4px"
          display="flex"
          alignItems="center"
        >
          {/* نشان‌دهنده درصد باتری */}
          <Box
            width={`${batteryPercentage}%`}
            height="100%"
            backgroundColor={getColor()}
            borderRadius="2px"
            transition="width 0.5s"
            position="absolute"
            left="0"
          />
          {/* سر باتری */}
          <Box
            position="absolute"
            right="-5px"
            top="25%"
            width="5px"
            height="50%"
            backgroundColor="black"
            borderRadius="2px"
          />
          {/* درصد باتری داخل آیکون */}
          <Text
            position="relative"
            zIndex="1"
            color="black"
            fontWeight="bold"
            width="100%"
            textAlign="center"
          >
            {Math.round(batteryPercentage)}%
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default BatteryIcon;
