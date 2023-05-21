import React from "react";
import SelectList from "../common/SelectList";

type costCenter = {
  id: string;
  projectId: string;
  code: string;
  name: string;
  budget:number;
  cost: number;
}

const CostCenterDropdown = ({
  costCenters,
  defaultValue,
  onCostCenterChange,
}: {
  costCenters: costCenter[]
  defaultValue: string | null,
  onCostCenterChange: (value: string) => void
}) => {
  const costCenterValues = costCenters.map((costCenter) => costCenter.id)
  return (
    <SelectList 
      value={defaultValue}
      options={costCenterValues}
      onChange={(value: string) => {
        onCostCenterChange(value);
      }}
    />
  );
};

export default CostCenterDropdown;
