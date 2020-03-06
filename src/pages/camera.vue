<template>
  <q-media-player
    type="video"
    background-color="black"
    :muted="muted"
    radius="1rem"
    :autoplay="true"
    :show-big-play-button="true"
    :sources="video.sources"
    :poster="video.poster"
    :tracks="video.tracks"
    track-language="English"
    @ended="onEnded"
  >
    <template v-if="overlay" v-slot:overlay>
      <div>
        <img src="statics/quasar-logo.png" style="width: 30vw; max-width: 50px; opacity: 0.25;" />
      </div>
    </template>
  </q-media-player>
</template>