<template lang="pug">
#app
  nav.p-3.bg-blue-500.text-white
    .navbar-nav Not Final Cut

  .container.mx-auto.py-5(v-if="isLoading")
    svg.animate-spin.h-8.w-8.mx-auto(
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    )
      circle.opacity-25(cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4")
      path.opacity-75(fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z")

  .container.mx-auto.flex.pt-4(v-else)
    .video(class="w-1/2")
      video.w-full.mb-3(
        :src="movieSrc",
        controls,
      )

      h1.text-lg.text-bold.mb-2 {{title}}
      p.mb-2 创建时间：
        time.text-gray-500(:datetime="createdAt") {{createdAt}}
      p 更新时间：
        time.text-gray-500(:datetime="updatedAt") {{updatedAt}}

    .flex-1.ml-3.border-2.border-gray-200.rounded-md
      h2.text-lg.text-bold.pl-3.py-4 字幕控制
      table.table.w-full
        thead
          tr
            th.bg-red-300.text-white.leading-loose.px-3.border-b-2.border-white.border-r-2 时间
            th.bg-pink-300.text-white.px-3.border-b-2.border-white 字幕
        tbody
          tr(v-for="item in subtitles")
            td.bg-red-50.leading-relaxed.px-3.border-b-2.border-r-2.border-white {{item.BeginTime}}
            td.bg-pink-50.px-3.border-b-2.border-white {{item.Text}}

</template>

<script>
import axios from 'axios';
import {
  ref,
  computed,
  onMounted,
} from 'vue';

export default {
  setup() {
    const isLoading = ref(true);
    const movieSrc = ref('');
    const title = ref('');
    const createdAt = ref('');
    const updatedAt = ref('');
    const page = ref(0);
    const rawSubtitles = ref(null);

    const subtitles = computed(() => {
      const {Sentences = []} = rawSubtitles.value;
      return Sentences.slice(page.value, 20);
    });

    onMounted(async () => {
      const project = await axios.get('/api/project.json');
      const {
        movie,
        createdAt: c,
        updatedAt: u,
        rawResult,
      } =  project.data;
      movieSrc.value = '/source/' + movie;
      title.value = movie;
      createdAt.value = c;
      updatedAt.value = u;
      isLoading.value = false;
      rawSubtitles.value = rawResult;
    });

    return {
      isLoading,

      movieSrc,
      title,
      createdAt,
      updatedAt,
      subtitles,
    };
  },
};
</script>
