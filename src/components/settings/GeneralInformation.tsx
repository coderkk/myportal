import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import type { Project } from "@prisma/client";
import classNames from "classnames";
import { useSession } from "next-auth/react";
import Image from "next/image";
import type { BaseSyntheticEvent } from "react";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useGetMyProfessionalRole,
  useUpdateMyProfessionalRole,
} from "../../hooks/me";
import { useGetProjectCreator, useUpdateProject } from "../../hooks/project";
import Spinner from "../common/Spinner";

const professionalRoles = [
  { label: "Accountant", value: "ACCOUNTANT" },
  { label: "Document Controller", value: "DOCUMENT_CONTROLLER" },
  { label: "Foreman", value: "FOREMAN" },
  { label: "Project Engineer", value: "PROJECT_ENGINEER" },
  { label: "Project Member", value: "PROJECT_MEMBER" },
  { label: "Project Manager", value: "PROJECT_MANAGER" },
  { label: "Project Director", value: "PROJECT_DIRECTOR" },
  { label: "Quantity Surveyor", value: "QUANTITY_SURVEYOR" },
  { label: "Site Supervisor", value: "SITE_SUPERVISOR" },
  { label: "Site Engineer", value: "SITE_ENGINEER" },
  { label: "Site Administrator", value: "SITE_ADMIN" },
] as const;

// create a function that maps the value to the label
const mapProfessionalRoleToLabel = (value: string) => {
  const found = professionalRoles.find((role) => role.value === value);
  return found ? found.label : "";
};

// create a function that maps the label to the value
const mapProfessionalRoleToValue = (label: string) => {
  const found = professionalRoles.find((role) => role.label === label);
  return found ? found.value : "PROJECT_MEMBER";
};

// TODO: add real plans and update callback needs to actually save the plan
const plans = ["Free", "Basic", "Premium"];

type FormValues = {
  projectName: string;
};

const GeneralInformation = ({
  project,
  isCreator,
}: {
  project: Project;
  isCreator: boolean;
}) => {
  const session = useSession();
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const { myProfessionalRole, isLoading } = useGetMyProfessionalRole({
    projectId: project.id,
  });
  const [selectedProfessionalRole, setSelectedProfessionalRole] = useState(
    mapProfessionalRoleToLabel(myProfessionalRole || "ACCOUNTANT")
  );
  const { updateProject } = useUpdateProject();
  const { updateMyProfessionalRole } = useUpdateMyProfessionalRole();
  const { creator } = useGetProjectCreator({ projectId: project.id });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    values: {
      projectName: project.name,
    },
  });

  const onSubmit = (
    data: FormValues,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    updateProject({
      projectId: project.id,
      projectName: data.projectName,
    });
  };
  useEffect(() => {
    setSelectedProfessionalRole(
      mapProfessionalRoleToLabel(myProfessionalRole || "ACCOUNTANT")
    );
  }, [myProfessionalRole]);
  return (
    <span className="m-8 flex flex-col ">
      <span className="mb-4 text-xl text-blue-500">
        General information
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-800">
              Project Information
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Project information and settings.
            </p>
            {creator && !isCreator && (
              <p className="mt-1 text-sm leading-6 text-gray-400">
                To update the project name or plan, please contact{" "}
                {creator.name} ({creator.email}).
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            className="md:col-span-2"
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
              <div className="col-span-full">
                <label
                  htmlFor="projectName"
                  className="block text-sm font-medium leading-6 text-gray-800"
                >
                  Project name
                </label>
                <div className="mt-2">
                  <input
                    id="projectName"
                    disabled={!isCreator}
                    className={classNames(
                      errors.projectName
                        ? "border-red-400 focus:border-red-400"
                        : " focus:border-blue-400",
                      "block w-full rounded-md border-2 bg-white/5 py-2 pl-3 text-gray-800 shadow-md hover:outline-none focus:outline-none sm:text-sm sm:leading-6"
                    )}
                    {...register("projectName", {
                      required: true,
                    })}
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="timezone"
                  className="block text-sm font-medium leading-6 text-gray-800"
                >
                  Current Plan
                </label>
                <div className="mt-2">
                  <Listbox
                    value={selectedPlan}
                    onChange={setSelectedPlan}
                    disabled={!isCreator}
                  >
                    <div className="relative mt-1">
                      <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
                        <span className="block truncate">{selectedPlan}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {plans.map((plan, personIdx) => (
                            <Listbox.Option
                              key={personIdx}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? "bg-blue-10 text-blue-900"
                                    : "text-gray-900"
                                }`
                              }
                              value={plan}
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? "font-medium" : "font-normal"
                                    }`}
                                  >
                                    {plan}
                                  </span>
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                      <CheckIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>
              </div>
            </div>

            <div className="mt-8 flex w-full">
              {isLoading ? (
                <Spinner />
              ) : !isCreator ? (
                <div
                  className="flex w-full items-center border-l-4 border-orange-500 bg-orange-100 p-4 text-sm text-amber-700 sm:max-w-xl"
                  role="alert"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="mr-2 h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                  <p>Contact the project owner to update your plan.</p>
                </div>
              ) : (
                <div>
                  {errors.projectName && (
                    <span className="mb-2 flex justify-center text-xs italic text-red-400">
                      Project name is required
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={!isCreator}
                    className="rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white  shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-800">
              Personal Information
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Information about you. If you wish to change your name, email or
              image, go to your email provider (like Google) and change it
              there.
            </p>
            {creator && !isCreator && (
              <p className="mt-1 text-sm leading-6 text-gray-400">
                To update your role, please contact {creator.name} (
                {creator.email}).
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
              <div className="col-span-full flex items-center gap-x-8">
                <Image
                  src={session.data?.user?.image || "/images/default-photo.jpg"}
                  alt="Your profile picture"
                  width={50}
                  height={50}
                />

                <div className="col-span-full flex flex-col text-lg">
                  <span className="text-gray-800">
                    {session.data?.user?.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    {session.data?.user?.email}
                  </span>
                </div>
              </div>

              <div className="col-span-full">
                {!isLoading && (
                  <>
                    <label
                      htmlFor="timezone"
                      className="block text-sm font-medium leading-6 text-gray-800"
                    >
                      Role
                    </label>

                    <div className="mt-2">
                      <Listbox
                        value={selectedProfessionalRole}
                        onChange={setSelectedProfessionalRole}
                        disabled={!isCreator}
                      >
                        <div className="relative mt-1">
                          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
                            <span className="block truncate">
                              {selectedProfessionalRole}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronUpDownIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            </span>
                          </Listbox.Button>
                          <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {professionalRoles.map(
                                (professionalRole, personIdx) => (
                                  <Listbox.Option
                                    key={personIdx}
                                    className={({ active }) =>
                                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                        active
                                          ? "bg-blue-10 text-blue-900"
                                          : "text-gray-900"
                                      }`
                                    }
                                    value={professionalRole.label}
                                  >
                                    {({ selected }) => (
                                      <>
                                        <span
                                          className={`block truncate ${
                                            selected
                                              ? "font-medium"
                                              : "font-normal"
                                          }`}
                                        >
                                          {professionalRole.label}
                                        </span>
                                        {selected ? (
                                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                            <CheckIcon
                                              className="h-5 w-5"
                                              aria-hidden="true"
                                            />
                                          </span>
                                        ) : null}
                                      </>
                                    )}
                                  </Listbox.Option>
                                )
                              )}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </Listbox>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-8 flex">
              {isLoading ? (
                <Spinner />
              ) : !isCreator ? (
                <div
                  className="flex w-full items-center border-l-4 border-orange-500 bg-orange-100 p-4 text-sm text-amber-700 sm:max-w-xl"
                  role="alert"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="mr-2 h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                  <p>Contact the project owner to update your role.</p>
                </div>
              ) : (
                <button
                  type="button"
                  className="rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  onClick={() => {
                    updateMyProfessionalRole({
                      projectId: project.id,
                      userProfessionalRole: mapProfessionalRoleToValue(
                        selectedProfessionalRole
                      ),
                    });
                  }}
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      </span>
    </span>
  );
};

export default GeneralInformation;
