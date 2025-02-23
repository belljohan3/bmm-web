import type { AsyncData } from "nuxt/app";

export default function reactiveApi<Data, Error>(data: AsyncData<Data, Error>) {
  const stopHandler = watch(
    [useNuxtApp().$i18n.locale, () => contentLanguageStore().contentLanguages],
    () => {
      data.refresh();
    },
  );

  return { ...data, stopHandler };
}
