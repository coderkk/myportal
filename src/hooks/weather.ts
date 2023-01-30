import { api } from "../utils/api";

export const useUpdateSiteDiaryWeather = () => {
  const utils = api.useContext();
  const { mutate: updateSiteDiaryWeather } =
    api.weather.updateSiteDiaryWeather.useMutation({
      // there is no need for an onSuccess OU because the dropdown is already an OU.
      // we do this to take care of the edge case where the user clicks > 1 weather dropdown
      // in succession quickly. Without this, it's possible that the client might send
      // null for one of the weather conditions even though the client is showing
      // a non-null value. This happens if the next click is faster than onSettled() and
      // the server and client have not synced.
      async onMutate({ siteDiaryId, morning, afternoon, evening }) {
        await utils.siteDiary.getSiteDiary.cancel();
        const previousData = utils.siteDiary.getSiteDiary.getData();
        utils.siteDiary.getSiteDiary.setData(
          { siteDiaryId: siteDiaryId },
          (oldSiteDiary) => {
            if (oldSiteDiary) {
              const newSiteDiary = { ...oldSiteDiary };
              newSiteDiary.weather = {
                id: Date.now().toString(),
                morning: morning || null,
                afternoon: afternoon || null,
                evening: evening || null,
                siteDiaryId: siteDiaryId,
              };
              return newSiteDiary;
            } else {
              return oldSiteDiary;
            }
          }
        );
        return () =>
          utils.siteDiary.getSiteDiary.setData(
            { siteDiaryId: siteDiaryId },
            previousData
          );
      },
      async onSettled() {
        await utils.siteDiary.getSiteDiary.invalidate();
      },
    });
  return {
    updateSiteDiaryWeather,
  };
};
