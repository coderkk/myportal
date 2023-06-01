import SelectList from "../common/SelectList";

type Budget = {
  id: string;
  costCode: string;
  description: string;
  expectedBudget: number;
  costsIncurred: number;
  difference: number;
};

const CostCodeDropdown = ({
  budgets,
  defaultValue,
  onCostCodeChange,
  error = false
}: {
  budgets: Budget[];
  defaultValue: string | null;
  onCostCodeChange: (value: string) => void;
  error?: boolean;
}) => {
  const budgetValues = budgets.map((budget) => {
    return {value: budget.id, label: `${budget.costCode} (${budget.description})`}
  });
  return (
    <SelectList
      value={
        defaultValue
          ? defaultValue
          : ""
      }
      placeholder="Select cost code"
      options={
        budgetValues
      }
      onChange={(value: string) => {
          onCostCodeChange(value);
        }
      }
      error={error}
    />
  );
};

export default CostCodeDropdown;
