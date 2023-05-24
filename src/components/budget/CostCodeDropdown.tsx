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
}: {
  budgets: Budget[];
  defaultValue: string | null;
  onCostCodeChange: (value: string) => void;
}) => {
  const budgetValues = budgets.map((budget) => budget.id);
  return (
    <SelectList
      value={
        defaultValue
          ? defaultValue
          : ((budgetValues.length > 0)
          ? budgetValues[0]
          : "No cost code")
      }
      options={
        budgetValues.length > 0 ? budgetValues : ["No cost code"]
      }
      onChange={(value: string) => {
        onCostCodeChange(value);
      }}
    />
  );
};

export default CostCodeDropdown;
