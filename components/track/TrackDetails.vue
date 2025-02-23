<script setup lang="ts">
import type { TrackModel } from "@bcc-code/bmm-sdk-fetch";

const { t } = useI18n();

defineProps<{
  track: TrackModel;
}>();

const { locale } = useI18n();
const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  };
  return new Intl.DateTimeFormat(locale.value, options).format(dateToUtc(date));
};
const songbook = (apiName: string | null | undefined) => {
  if (apiName === "herrens_veier") return "HV";
  if (apiName === "mandelblomsten") return "FMB";
  return apiName;
};

type Field = {
  label: string;
  text: string;
};

const extractFields = (track: TrackModel) => {
  const items: Field[] = [];

  if (track.meta?.album)
    items.push({ label: t("track.details.album"), text: track.meta?.album });
  if (track.publishedAt)
    items.push({
      label: t("track.details.publish-date"),
      text: formatDate(track.publishedAt),
    });

  items.push({
    label: t("track.details.duration"),
    text: formatTime(((track.media || [])[0]?.files || [])[0]?.duration || 0),
  });
  if (track.songbookRelations && track.songbookRelations.length > 0)
    items.push({
      label: t("track.details.song-number"),
      text: track.songbookRelations
        ?.map((r) => `${songbook(r.name)} ${r.id}`)
        .join(", "),
    });
  if (track.contributors) {
    const lyricists = track.contributors.filter((c) => c.type === "lyricist");
    if (lyricists.length > 0)
      items.push({
        label: t("track.details.lyricist"),
        text: lyricists?.map((c) => c.name).join(", "),
      });
    const composers = track.contributors.filter((c) => c.type === "composer");
    if (composers.length > 0)
      items.push({
        label: t("track.details.composer"),
        text: composers?.map((c) => c.name).join(", "),
      });
    const arrangers = track.contributors.filter((c) => c.type === "arranger");
    if (arrangers.length > 0)
      items.push({
        label: t("track.details.arranger"),
        text: arrangers?.map((c) => c.name).join(", "),
      });
  }
  if (track.publisher)
    items.push({
      label: t("track.details.publisher"),
      text: track.publisher,
    });
  if (track.copyright)
    items.push({ label: t("track.details.copyright"), text: track.copyright });
  return items;
};
</script>

<template>
  <div class="relative flex items-center justify-normal gap-4">
    <ProtectedImage
      v-if="track.meta?.attachedPicture"
      :src="track.meta?.attachedPicture"
      class="aspect-square w-24 rounded-md bg-background-2"
    />
    <div>
      <h3 class="text-label-1 py-1 text-2xl font-extrabold">
        {{ track.title }}
      </h3>
      <div class="text-label-2 text-[1.1rem]">
        {{ track.meta?.artist }}
      </div>
    </div>
  </div>
  <br />

  <template v-if="track.externalRelations?.length ?? 0 > 0">
    <hr class="bg-background-2 border-0 h-[2px]" />
    <div class="py-4 text-lg">
      <div>
        <b>{{ t("track.details.reference") }}</b>
      </div>
      <div>
        <NuxtLink
          v-for="reference in track.externalRelations?.filter((x) => x.url)"
          :key="reference.url"
          :to="parseLink(reference.url || '')"
          class="bg-background-2 my-2 p-3 rounded-2xl flex flex-row gap-2 text-2xl"
        >
          <NuxtIcon
            :name="reference.hasListened ? 'icon.checkmark' : 'icon.link'"
          ></NuxtIcon>
          <div v-if="reference.name">
            <div
              v-for="(part, index) in reference.name.split(' / ')"
              :key="part"
              :class="index === 0 ? 'text-base' : 'text-sm text-label-2'"
            >
              {{ part }}
            </div>
          </div>
          <NuxtIcon name="icon.chevron.right" class="ml-auto"></NuxtIcon>
        </NuxtLink>
      </div>
    </div>
    <hr class="bg-background-2 border-0 h-[2px]" />
  </template>

  <template v-for="(field, index) in extractFields(track)" :key="index">
    <hr class="bg-background-2 border-0 h-[2px]" />
    <div class="py-4 text-lg flex">
      <div class="w-40 shrink-0">
        <b>{{ field.label }}</b>
      </div>
      <div class="text-label-2">{{ field.text }}</div>
    </div>
  </template>
</template>
