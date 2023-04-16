import { api } from "../utils/api";

export const useCreateBudget = ({
  pageIndex,
  pageSize,
  searchKey,
}: {
  pageIndex: number;
  pageSize: number;
  searchKey: string;
}) => {
  const utils = api.useContext();
  const { mutate: createBudget } = api.budget.createBudget.useMutation({
    async onMutate({ projectId, description, expectedBudget, costsIncurred }) {
      await utils.budget.getBudgets.cancel();
      const previousData = utils.budget.getBudgets.getData();
      utils.budget.getBudgets.setData(
        {
          projectId: projectId,
          searchKey: searchKey,
          pageSize: pageSize,
          pageIndex: pageIndex,
        },
        (oldBudgets) => {
          if (oldBudgets) {
            // only opitmistic update if we're on the first page and there is no search key
            if (pageIndex !== 0 || searchKey !== "")
              return {
                budgets: oldBudgets.budgets,
                count: oldBudgets.count + 1,
              };
            const optimisticUpdateObject = {
              id: Date.now().toString(),
              costCode: "UPDATING",
              difference: expectedBudget - costsIncurred,
              description: description,
              expectedBudget: expectedBudget,
              costsIncurred: costsIncurred,
            };
            return {
              budgets: [
                optimisticUpdateObject,
                ...oldBudgets.budgets.slice(0, oldBudgets.budgets.length - 1),
              ],
              count: oldBudgets.count + 1,
            };
          } else {
            const optimisticUpdateObject = {
              id: Date.now().toString(),
              costCode: "UPDATING",
              difference: expectedBudget - costsIncurred,
              description: description,
              expectedBudget: expectedBudget,
              costsIncurred: costsIncurred,
            };
            return {
              budgets: [optimisticUpdateObject],
              count: 1,
            };
          }
        }
      );
      return () =>
        utils.budget.getBudgets.setData(
          {
            projectId: projectId,
            searchKey: searchKey,
            pageSize: pageSize,
            pageIndex: pageIndex,
          },
          previousData
        );
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    async onSettled() {
      await utils.budget.getBudgets.invalidate();
    },
  });
  return {
    createBudget,
  };
};

export const useGetBudgets = ({
  projectId,
  pageSize,
  pageIndex,
  searchKey,
}: {
  projectId: string;
  pageSize: number;
  pageIndex: number;
  searchKey: string;
}) => {
  const { data, isLoading, isSuccess, isFetching } =
    api.budget.getBudgets.useQuery(
      {
        projectId: projectId,
        pageSize: pageSize,
        pageIndex: pageIndex,
        searchKey: searchKey,
      },
      {
        keepPreviousData: true,
      }
    );
  return {
    budgets: data?.budgets || [],
    count: data?.count || 0,
    isLoading: isLoading,
    isSuccess: isSuccess,
    isFetching: isFetching,
  };
};

export const useUpdateBudget = ({
  pageIndex,
  pageSize,
  searchKey,
  projectId,
}: {
  pageIndex: number;
  pageSize: number;
  searchKey: string;
  projectId: string;
}) => {
  const utils = api.useContext();
  const { mutate: updateBudget } = api.budget.updateBudget.useMutation({
    async onMutate({ budgetId, description, expectedBudget, costsIncurred }) {
      await utils.budget.getBudgets.cancel();
      const previousData = utils.budget.getBudgets.getData();
      utils.budget.getBudgets.setData(
        {
          projectId: projectId,
          searchKey: searchKey,
          pageSize: pageSize,
          pageIndex: pageIndex,
        },
        (oldBudgets) => {
          if (oldBudgets) {
            const newBudgets = { ...oldBudgets };
            newBudgets.budgets = oldBudgets?.budgets.map((budget) => {
              return { ...budget };
            });
            const budgetToUpdateIndex = newBudgets.budgets.findIndex(
              (budget) => budget.id === budgetId
            );
            const updatedBudget = newBudgets.budgets[budgetToUpdateIndex];
            if (updatedBudget) {
              updatedBudget.description = description;
              updatedBudget.expectedBudget = expectedBudget;
              updatedBudget.costsIncurred = costsIncurred;
              updatedBudget.difference = expectedBudget - costsIncurred;
              newBudgets.budgets[budgetToUpdateIndex] = updatedBudget;
            }
            return newBudgets;
          } else {
            return oldBudgets;
          }
        }
      );
      return () =>
        utils.budget.getBudgets.setData(
          {
            projectId: projectId,
            searchKey: searchKey,
            pageSize: pageSize,
            pageIndex: pageIndex,
          },
          previousData
        );
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    onSuccess(data, { budgetId, description, expectedBudget, costsIncurred }) {
      utils.budget.getBudgets.setData(
        {
          projectId: projectId,
          searchKey: searchKey,
          pageSize: pageSize,
          pageIndex: pageIndex,
        },
        (oldBudgets) => {
          if (oldBudgets) {
            const newBudgets = { ...oldBudgets };
            newBudgets.budgets = oldBudgets?.budgets.map((budget) => {
              return { ...budget };
            });
            const budgetToUpdateIndex = newBudgets.budgets.findIndex(
              (budget) => budget.id === budgetId
            );
            const updatedBudget = newBudgets.budgets[budgetToUpdateIndex];
            if (updatedBudget) {
              updatedBudget.description = description;
              updatedBudget.expectedBudget = expectedBudget;
              updatedBudget.costsIncurred = costsIncurred;
              updatedBudget.difference = expectedBudget - costsIncurred;
              newBudgets.budgets[budgetToUpdateIndex] = updatedBudget;
            }
            return newBudgets;
          } else {
            return oldBudgets;
          }
        }
      );
    },
    async onSettled() {
      await utils.budget.getBudgets.invalidate();
    },
  });
  return {
    updateBudget,
  };
};

export const useDeleteBudget = () => {
  const utils = api.useContext();
  const { mutate: deleteBudget } = api.budget.deleteBudget.useMutation({
    async onSettled() {
      await utils.budget.getBudgets.invalidate();
    },
  });
  return {
    deleteBudget,
  };
};
