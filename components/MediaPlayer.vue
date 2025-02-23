<script setup lang="ts">
import { MediaPlayerStatus } from "~/plugins/mediaPlayer/mediaPlayer";

const open = ref(false);
const titleRef = ref<HTMLElement | null>(null);
const subTitleRef = ref<HTMLElement | null>(null);
const titleRefSmallPlayer = ref<HTMLElement | null>(null);

const {
  status,
  play,
  pause,
  currentTrack,
  currentPosition,
  currentTrackDuration,
  isLoading,
  queue,
  next,
  hasNext,
  previous,
  hasPrevious,
  rewind,
  fastForward,
} = useNuxtApp().$mediaPlayer;

const onPointerUpProgressBar = (event: PointerEvent) => {
  const rect = (event.currentTarget as Element)?.getBoundingClientRect();
  currentPosition.value =
    ((event.clientX - rect.left) / rect.width) * currentTrackDuration.value;
};
const onPointerDownProgressBar = () => {
  // TODO: let user drag the progress-bar on mouse-down,
  // update the time while keeping the song playing,
  // and update the players position only on mouse-up.
};

const getMarqueeClass = (value: HTMLElement, center: Boolean) => {
  const centerClasses = center ? { "ml-auto": true, "mr-auto": true } : {};
  if (value === null) return centerClasses;
  if (!value || !value.parentElement) return centerClasses;
  const offset = -(value.scrollWidth - value.parentElement.clientWidth) || 0;
  value.style.setProperty("--animate-marquee-offset", `${offset}px`);
  const isWiderThanParent =
    value &&
    value.parentElement &&
    value.scrollWidth > value.parentElement.getBoundingClientRect().width;
  return {
    "animate-marquee": isWiderThanParent,
    ...(isWiderThanParent ? {} : centerClasses),
  };
};
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="translate-y-[80vh]"
    leave-active-class="transition-all z-20 duration-500 ease-out"
    leave-to-class="translate-y-[80vh]"
  >
    <div
      v-if="!open"
      class="group fixed bottom-5 right-5 w-[400px]"
      @click.stop="open = !open"
    >
      <svg
        class="absolute left-0 top-0 opacity-0 group-hover:opacity-100 group-hover:-left-1 group-hover:-top-1 transition-all duration-200 ease-out"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="11"
        height="11"
        viewBox="0 0 11 11"
      >
        <path
          d="M0 1.5C0 0.671573 0.671573 0 1.5 0H7.37868C8.71504 0 9.38429 1.61571 8.43934 2.56066L2.56066 8.43934C1.61572 9.38428 0 8.71504 0 7.37868V1.5Z"
          fill="currentColor"
        />
      </svg>
      <div
        class="shadow-player relative overflow-hidden flex flex-col rounded-2xl bg-background-1 p-3"
      >
        <div class="flex gap-4">
          <div class="aspect-square h-[48px] rounded-md">
            <ProtectedImage
              v-if="currentTrack?.meta?.attachedPicture"
              :src="currentTrack?.meta?.attachedPicture"
            />
          </div>
          <div
            class="flex gap-1 w-full flex-col overflow-hidden whitespace-nowrap"
          >
            <div
              ref="titleRefSmallPlayer"
              class="w-fit"
              :class="
                titleRefSmallPlayer
                  ? getMarqueeClass(titleRefSmallPlayer, false)
                  : null
              "
            >
              <h3
                class="truncate text-lg font-semibold leading-tight"
                :title="currentTrack?.title || ''"
              >
                {{ currentTrack?.title }}
              </h3>
            </div>
            <div class="w-full truncate text-base leading-snug text-label-2">
              <span
                v-if="currentTrack?.meta?.artist"
                :title="currentTrack?.meta?.artist"
              >
                {{ currentTrack.meta?.artist }}
              </span>
              <span
                v-if="currentTrack?.meta?.artist && currentTrack?.meta?.album"
              >
                -
              </span>
              <span
                v-if="currentTrack?.meta?.album"
                :title="currentTrack?.meta?.album"
              >
                {{ currentTrack.meta?.album }}
              </span>
            </div>
          </div>
          <button
            v-if="isLoading"
            class="flex aspect-square w-12 text-2xl justify-center items-center"
          >
            <NuxtIcon name="icon.loading (animation)" filled />
          </button>
          <button
            v-if="!isLoading && status === MediaPlayerStatus.Playing"
            class="flex aspect-square w-12 text-3xl transition-all duration-200 ease-out hover:text-4xl justify-center items-center"
            @click.stop="pause()"
          >
            <NuxtIcon name="icon.pause.large" />
          </button>
          <button
            v-if="!isLoading && status !== MediaPlayerStatus.Playing"
            class="flex aspect-square w-12 text-3xl transition-all duration-200 ease-out hover:text-4xl justify-center items-center"
            @click.stop="play()"
          >
            <NuxtIcon name="play" />
          </button>
        </div>
        <svg
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="absolute bottom-0 left-1 right-1 w-full h-1 hover:h-1.5 transition-all duration-200 ease-out"
          @pointerdown="onPointerDownProgressBar"
          @pointerup="onPointerUpProgressBar"
          @click.stop
        >
          <rect width="100%" height="100%" class="fill-background-2" />
          <rect
            v-if="
              Number.isFinite(currentPosition) &&
              Number.isFinite(currentTrackDuration)
            "
            :width="(currentPosition / currentTrackDuration) * 100 + '%'"
            height="100%"
            class="fill-label-1"
          />
        </svg>
      </div>
    </div>
  </Transition>

  <div v-if="open" class="min-w-[400px] ml-5"></div>
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="translate-y-[80vh]"
    leave-active-class="transition-all z-30 duration-500 ease-out"
    leave-to-class="translate-y-[80vh]"
  >
    <div
      v-if="open"
      class="shadow-player h-100 fixed bottom-5 right-5 flex flex-col rounded-2xl bg-background-1 w-[400px]"
    >
      <div class="px-3 py-6">
        <div class="flex items-center justify-center h-60">
          <ProtectedImage
            v-if="currentTrack?.meta?.attachedPicture"
            :src="currentTrack?.meta?.attachedPicture"
            class="relative z-10 overflow-hidden rounded-md w-40"
          />
          <ProtectedImage
            v-if="currentTrack?.meta?.attachedPicture"
            :src="currentTrack?.meta?.attachedPicture"
            class="absolute top-[59px] z-0 w-[160px] blur-[80px]"
            no-border
          />
        </div>
        <div
          class="flex flex-col py-3 gap-1 overflow-x-hidden whitespace-nowrap"
        >
          <div
            ref="titleRef"
            class="w-fit"
            :class="titleRef ? getMarqueeClass(titleRef, true) : null"
          >
            <h3
              class="text-center text-lg font-semibold leading-tight"
              :title="currentTrack?.title || ''"
            >
              {{ currentTrack?.title }}
            </h3>
          </div>
          <div
            class="overflow-x-hidden whitespace-nowrap text-center text-base leading-snug text-label-2"
          >
            <div
              ref="subTitleRef"
              class="w-fit"
              :class="subTitleRef ? getMarqueeClass(subTitleRef, true) : null"
            >
              <span
                v-if="currentTrack?.meta?.artist"
                :title="currentTrack?.meta?.artist"
              >
                {{ currentTrack.meta?.artist }}
              </span>
              <span
                v-if="currentTrack?.meta?.artist && currentTrack?.meta?.album"
              >
                -
              </span>
              <span
                v-if="currentTrack?.meta?.album"
                :title="currentTrack?.meta?.album"
              >
                {{ currentTrack.meta?.album }}
              </span>
            </div>
          </div>
        </div>
        <div class="px-4 py-2">
          <div class="py-2 group h-3 flex items-center">
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="width-full rounded-full overflow-hidden w-full h-2 group-hover:h-3 transition-all duration-200 ease-out"
              @pointerdown="onPointerDownProgressBar"
              @pointerup="onPointerUpProgressBar"
              @click.stop
            >
              <rect width="100%" height="100%" class="fill-background-2" />
              <rect
                v-if="
                  Number.isFinite(currentPosition) &&
                  Number.isFinite(currentTrackDuration)
                "
                :width="(currentPosition / currentTrackDuration) * 100 + '%'"
                height="100%"
                class="fill-label-1"
              />
            </svg>
          </div>
          <div class="flex justify-between py-0.5 text-sm">
            <span>
              <TimeDuration :duration="currentPosition"></TimeDuration
            ></span>
            <span>
              <TimeDuration :duration="currentTrackDuration"></TimeDuration
            ></span>
          </div>
        </div>
        <div class="flex justify-evenly px-4 py-2">
          <button
            :class="
              currentPosition === 0 || isLoading
                ? 'text-label-4 '
                : 'hover:text-3xl border-background-2 border'
            "
            class="flex rounded-full aspect-square w-14 text-2xl transition-all duration-200 ease-out justify-center items-center"
            @click.stop="rewind()"
          >
            <NuxtIcon name="icon.rewind.large" filled />
          </button>
          <button
            :class="
              !hasPrevious || isLoading
                ? 'text-label-4'
                : 'hover:text-3xl bg-background-2'
            "
            class="flex rounded-full aspect-square w-14 text-2xl transition-all duration-200 ease-out justify-center items-center"
            @click.stop="previous()"
          >
            <NuxtIcon name="icon.previous.track.large" filled />
          </button>

          <button
            v-if="isLoading"
            class="flex rounded-full aspect-square bg-background-2 w-14 text-2xl justify-center items-center"
          >
            <NuxtIcon name="icon.loading (animation)" filled />
          </button>
          <button
            v-if="!isLoading && status === MediaPlayerStatus.Playing"
            class="flex rounded-full aspect-square bg-background-2 w-14 text-3xl transition-all duration-200 ease-out hover:text-4xl justify-center items-center"
            @click.stop="pause()"
          >
            <NuxtIcon name="icon.pause.large" />
          </button>
          <button
            v-if="!isLoading && status !== MediaPlayerStatus.Playing"
            class="flex rounded-full aspect-square bg-background-2 w-14 text-3xl transition-all duration-200 ease-out hover:text-4xl justify-center items-center"
            @click.stop="play()"
          >
            <NuxtIcon name="play" />
          </button>
          <button
            :class="
              !hasNext || isLoading
                ? 'text-label-4'
                : 'hover:text-3xl bg-background-2'
            "
            class="flex rounded-full aspect-square w-14 text-2xl transition-all duration-200 ease-out justify-center items-center"
            @click.stop="next()"
          >
            <NuxtIcon name="icon.next.track.large" filled />
          </button>

          <button
            :class="
              currentPosition >= currentTrackDuration || isLoading
                ? 'text-label-4'
                : 'hover:text-3xl border-background-2 border'
            "
            class="flex rounded-full aspect-square w-14 text-2xl transition-all duration-200 ease-out justify-center items-center"
            @click.stop="fastForward()"
          >
            <NuxtIcon name="icon.skip.large" filled />
          </button>
        </div>
        <div class="flex justify-between absolute z-10 top-4 left-4 right-4">
          <div
            class="rounded-full border border-label-separator p-1.5 cursor-pointer"
            @click.stop="open = !open"
          >
            <NuxtIcon name="icon.minify" filled class="text-xl" />
          </div>
          <div
            class="rounded-full border border-label-separator px-3 py-1.5 cursor-pointer text-sm"
            style="background-color: rgba(255, 0, 0, 0.4); color: red"
          >
            <!-- TODO: Implement option to change the language -->
            {{
              currentTrack?.language
                ? getLocalizedLanguageName(currentTrack.language)
                : ""
            }}
          </div>

          <TrackMenu
            v-if="currentTrack"
            :track="currentTrack"
            button-class="rounded-full border border-label-separator p-1.5"
          ></TrackMenu>
        </div>
      </div>
      <hr class="border-label-separator" />
      <div class="overflow-y-scroll">
        <div class="flex justify-between items-center pb-1 pt-4 px-6">
          <div class="text-label-3">Queue</div>
          <div class="flex gap-2">
            <button
              v-if="queue.isShuffled"
              class="rounded-full bg-background-4 p-2 text-background-3 hover:bg-background-3 hover:text-background-4 transition-all duration-200 ease-out"
              @click.stop="queue.unshuffle()"
            >
              <NuxtIcon name="icon.shuffle" class="text-2xl" />
            </button>
            <button
              v-else
              class="rounded-full bg-background-3 p-2 text-background-4 hover:bg-background-4 hover:text-background-3 transition-all duration-200 ease-out"
              @click.stop="queue.shuffle()"
            >
              <NuxtIcon name="icon.shuffle" class="text-2xl" />
            </button>
            <button
              class="rounded-full bg-background-3 p-2"
              style="background-color: rgba(255, 0, 0, 0.4); color: red"
            >
              <NuxtIcon name="icon.repeat" filled class="text-2xl" />
            </button>
          </div>
        </div>
        <ul class="px-3 pb-3">
          <li v-for="(item, i) in queue" :key="i" @click="queue.index = i">
            <div
              :class="
                queue.index === i ? 'bg-tint hover:bg-tint text-black-1' : ''
              "
              class="rounded-xl px-3 py-2 flex justify-between gap-2 cursor-pointer hover:bg-background-2 transition-all duration-500 ease-out"
            >
              <div class="truncate">
                <div>{{ item.meta?.title || item.title }}</div>
                <div
                  class="text-sm"
                  :class="queue.index === i ? 'text-black-2' : 'text-label-2'"
                >
                  <span v-if="item?.meta?.artist">
                    {{ item.meta?.artist }}
                  </span>
                  <span v-if="item?.meta?.artist && item?.meta?.album">
                    -
                  </span>
                  <span v-if="item?.meta?.album">
                    {{ item.meta?.album }}
                  </span>
                </div>
              </div>

              <div class="flex justify-between gap-2">
                <TrackMenu :track="item"></TrackMenu>
                <NuxtIcon
                  v-if="
                    queue.index === i && status === MediaPlayerStatus.Playing
                  "
                  name="icon.playing (animation)"
                  filled
                  class="text-2xl"
                />
              </div>
            </div>

            <hr
              v-if="!(queue.index - 1 === i || queue.index === i)"
              class="border-label-separator"
            />
          </li>
        </ul>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.shadow-player {
  max-height: calc(100vh - 1.25rem - 4.5rem);

  box-shadow:
    0px 4px 12px 0px rgba(0, 0, 0, 0.05),
    0px 1px 4px 0px rgba(0, 0, 0, 0.05),
    0px 0px 0px 1px rgba(0, 0, 0, 0.05);
}
.dark .shadow-player {
  box-shadow:
    0px 4px 12px 0px rgba(255, 255, 255, 0.05),
    0px 1px 4px 0px rgba(255, 255, 255, 0.05),
    0px 0px 0px 1px rgba(255, 255, 255, 0.05);
}
</style>
