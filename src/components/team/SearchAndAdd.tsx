import { useState } from "react";
import type { MultiValue } from "react-select";
import Select from "react-select";
import InviteButton from "./InviteButton";

export type userOption = {
  value: string;
  label: string;
  userName: string;
  userEmail: string;
  userImage: string;
  disabled: boolean;
};

const SearchAndAdd = ({
  formattedUsers,
  projectId,
}: {
  formattedUsers: userOption[];
  projectId: string;
}) => {
  const [selectedOptions, setSelectedOptions] = useState<userOption[]>([]);
  const handleChange = (newValue: MultiValue<userOption>) => {
    setSelectedOptions([...newValue]);
  };
  return (
    <>
      <Select
        value={selectedOptions.length === 0 ? null : selectedOptions} // needed so clear works properly
        className="w-full"
        isMulti={true}
        options={formattedUsers}
        isOptionDisabled={(option) => option.disabled}
        onChange={handleChange}
        styles={{
          option: (baseStyles, state) => ({
            ...baseStyles,
            color: state.isDisabled ? "grey" : "blue",
            fontSize: "small",
          }),
        }}
      />
      <InviteButton
        projectId={projectId}
        usersToBeAdded={selectedOptions}
        setSelectedOptions={setSelectedOptions}
      />
    </>
  );
};

export default SearchAndAdd;
