// file: src/components/BatteryIcon.tsx

import React from "react";
import { toBatteryPercentage } from "../utils/battery";

interface BatteryIconProps {
  batteryAmount: number;
}

const BatteryIcon: React.FC<BatteryIconProps> = ({ batteryAmount }) => {
  const batteryPercentage = toBatteryPercentage(batteryAmount);

  const getColor = () => {
    if (batteryPercentage >= 80) return "bg-emerald-500";
    if (batteryPercentage >= 45) return "bg-amber-400";
    if (batteryPercentage >= 20) return "bg-orange-400";
    return "bg-rose-500";
  };

  return (
    <div className="flex flex-col items-center gap-1 text-xs text-slate-500">
      <div className="relative flex h-7 w-14 items-center justify-center rounded-md border border-slate-300 bg-white px-1">
        <div className="absolute -right-2 h-3 w-1.5 rounded-sm bg-slate-400" />
        <div className="h-4 w-full overflow-hidden rounded-sm border border-slate-200 bg-slate-100">
          <div
            className={`h-full transition-all duration-500 ${getColor()}`}
            style={{ width: `${batteryPercentage}%` }}
          />
        </div>
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-slate-700">
          {Math.round(batteryPercentage)}%
        </span>
      </div>
    </div>
  );
};

export default BatteryIcon;
