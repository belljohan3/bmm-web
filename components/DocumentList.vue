<script setup lang="ts">
import type {
  IAllDocumentModels,
  TrackModel,
  SectionHeaderModel,
} from "@bcc-code/bmm-sdk-fetch";

type IDiscoverableGroup = {
  header: SectionHeaderModel | null;
  items: Exclude<IAllDocumentModels, SectionHeaderModel>[];
  useFlex: boolean;
};

const { t } = useI18n();

const props = defineProps<{
  items: IAllDocumentModels[] | null | undefined;
  pending: boolean;
}>();

const convertModels = (models: IAllDocumentModels[]) => {
  let currentSection: IDiscoverableGroup["items"] = [];
  const result: IDiscoverableGroup[] = [];
  const tiles: IDiscoverableGroup["items"] = [];

  models.forEach((el, i) => {
    if (el.type === "Tile") {
      if (!el.lastPositionInMs) tiles.push(el); // We currently don't support continuing from the position. Then it's better to hide it.
    } else if (el.type === "project_box" || el.type === "listening_streak") {
      console.log(
        `since we don't have a design for ${el.type} we don't render it.`,
      );
    } else if (el.type === "section_header") {
      currentSection = [];
      result.push({
        header: el,
        items: currentSection,
        useFlex: el.useCoverCarousel === true,
      });
    } else if (i === 0) {
      currentSection = [el];
      result.push({
        header: null,
        items: currentSection,
        useFlex: false,
      });
    } else {
      currentSection.push(el);
    }
  });
  if (tiles.length > 0) {
    result.unshift({ header: null, items: tiles, useFlex: true });
  }
  return result;
};

const { setQueue } = useNuxtApp().$mediaPlayer;

const playItem = (item: TrackModel, group: IDiscoverableGroup) => {
  const items = group.items.filter((c): c is TrackModel => c.type === "track");
  setQueue(
    items,
    items.findIndex((track) => track.id === item.id),
  );
};
const playSingleItem = (item: TrackModel) => {
  const items: TrackModel[] = [item];
  setQueue(items, 0); // ToDo: read item.lastPositionInMs and go to specific location
  // ToDo: load linked album (from showAllLink) and add remaining items to the queue
};
</script>

<template>
  <div>
    <template v-if="props.pending">
      <ul>
        <li
          v-for="index in 5"
          :key="index"
          class="my-6 h-11 w-full animate-pulse rounded-lg bg-background-2"
        ></li>
      </ul>
    </template>
    <template v-else-if="props.items"
      ><template
        v-for="group in convertModels(props.items)"
        :key="group.header?.id || 0"
      >
        <PageHeading v-if="group.header" :level="3" class="mt-12 mb-5">
          <div class="flex items-center justify-between">
            <div>
              <NuxtLink
                v-if="typeof group.header.link === 'string'"
                :to="parseLink(group.header.link)"
              >
                {{ group.header.title }}
              </NuxtLink>
              <span v-else>{{ group.header.title }}</span>
            </div>
            <NuxtLink
              v-if="group.header.link"
              :to="parseLink(group.header.link)"
            >
              <ButtonStyled intent="secondary" size="small">
                <span class="whitespace-nowrap">
                  {{ t("home.list.see-all") }}
                </span>
              </ButtonStyled>
            </NuxtLink>
          </div>
        </PageHeading>
        <div
          v-if="group.useFlex"
          class="flex flex-row flex-wrap gap-6 mt-3"
          :class="
            group.header && group.header?.useCoverCarousel && group.header?.link
              ? 'overflow-hidden max-h-[27.5rem] lg:max-h-[13rem]'
              : ''
          "
        >
          <template v-for="item in group.items" :key="item.id">
            <NuxtLink
              v-if="item.type === 'album'"
              :to="{ name: 'album-id', params: { id: item.id } }"
            >
              <ItemCard :item="item" />
            </NuxtLink>
            <NuxtLink
              v-else-if="item.type === 'playlist'"
              :to="{ name: 'playlist-curated-id', params: { id: item.id } }"
            >
              <ItemCard :item="item" />
            </NuxtLink>
            <NuxtLink
              v-else-if="item.type === 'podcast'"
              :to="{ name: 'playlist-podcast-id', params: { id: item.id } }"
            >
              <ItemCard :item="item" />
            </NuxtLink>

            <TileItem
              v-else-if="item.type === 'Tile' && item.track"
              :item="item"
              @play-track="playSingleItem(item.track)"
            ></TileItem>

            <div
              v-else
              class="grid w-52 flex-shrink-0 basis-52 gap-4"
              style="background-color: rgba(255, 0, 0, 0.4); color: red"
            >
              "{{ item.type }}" is not yet implemented ...
            </div>
          </template>
        </div>
        <ol
          v-else
          class="w-full divide-y divide-label-separator grid grid-cols-tracklist mt-3 lg:mt-6"
        >
          <template v-for="item in group.items" :key="item.id">
            <h2
              v-if="item.type === 'chapter_header'"
              class="text-2xl font-extrabold pt-10 pb-4"
            >
              {{ item.title }}
            </h2>
            <TrackItem
              v-else-if="item.type === 'track'"
              :track="item"
              :is-track-type-known="true"
              show-thumbnail
              @play-track="playItem(item, group)"
            ></TrackItem>
            <ContributorListItem
              v-else-if="item.type === 'contributor'"
              :contributor="item"
            ></ContributorListItem>
            <AlbumItem v-else-if="item.type === 'album'" :album="item" />
            <PlaylistItem
              v-else-if="item.type === 'playlist'"
              :playlist="item"
            />
            <PodcastItem v-else-if="item.type === 'podcast'" :podcast="item" />
            <li v-else class="col-span-full">
              <div style="background-color: rgba(255, 0, 0, 0.4); color: red">
                "{{ item.type }}" is not yet implemented ...
              </div>
            </li>
          </template>
        </ol>
      </template>
    </template>
    <template v-else>
      <div style="background-color: rgba(255, 0, 0, 0.4); color: red">
        This list is empty 😔
      </div>
    </template>
  </div>
</template>
