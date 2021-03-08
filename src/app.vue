<template lang="pug">
#app
  nav.p-3.bg-blue-500.text-white
    .navbar-nav Not Final Cut

  .container.mx-auto.py-5(v-if="isLoading")
    .bi.bi-spin.text-7xl.mx-auto

  .container.mx-auto.flex.pt-4(v-else)
    .video(class="w-1/2")
      h2.text-lg.text-bold.pl-3.py-4.border-2.border-gray-200.rounded-t-md.border-b-0 视频预览
      video.w-full.mb-3(
        :src="movieSrc",
        controls,
      )

      h1.text-lg.text-bold.mb-2 {{title}}
      p.mb-2 创建时间：
        time.text-gray-500(:datetime="createdAt") {{createdAt}}
      p 更新时间：
        time.text-gray-500(:datetime="updatedAt") {{updatedAt}}

      .action-bar.mt-4.flex
        button.w-32.py-2.rounded-md.border-2.border-green-400.bg-green-500.text-white(
          type="button",
          @click="doSave",
          :disabled="isSaving",
        )
          i.bi.bi-spin.animate-spin.mr-2(v-if="isSaving")
          i.bi.bi-check.mr-2(v-else)
          | 保存项目

        button.w-32.py-2.rounded-md.border-2.border-blue-400.bg-blue-500.text-white.ml-3(
          type="button",
          @click="doExport",
          :disabled="isExporting",
        )
          i.bi.bi-spin.animate-spin.mr-2(v-if="isExporting")
          i.bi.bi-file-earmark-play-fill.mr-2(v-else)
          | 导出视频

        button.w-32.py-2.rounded-md.border-2.border-indigo-400.bg-indigo-500.text-white.ml-3(
          type="button",
          @click="doExportSubtitles",
          :disabled="isExportingSubtitles",
        )
          i.bi.bi-spin.animate-spin.mr-2(v-if="isExportingSubtitles")
          i.bi.bi-file-earmark-font-fill.mr-2(v-else)
          | 导出字幕


    .flex-1.ml-3.border-2.border-gray-200.rounded-md.relative
      h2.text-lg.text-bold.pl-3.py-4 调整字幕
      table.table.w-full
        thead
          tr
            th.bg-red-300.text-white.leading-loose.px-3.border-b-2.border-white.border-r-2(
              class="w-1/3",
            ) 时间
            th.bg-pink-300.text-white.px-3.border-b-2.border-white 字幕
        tbody
          tr(v-for="item in subtitles")
            td.bg-red-50.leading-relaxed.px-3.py-2.border-b-2.border-r-2.border-white
              small.text-gray-400 开始：
              strong {{item.start}}
              br
              small.text-gray-400 持续：
              strong.text-green-500.text-sm {{item.duration}}
            td.bg-pink-50.px-3.py-2.border-b-2.border-white
              span.inline-block.px-1.cursor-pointer(
                v-for="word in item.words",
                class="border-2 border-transparent hover:border-red-400",
                @click="doEdit($event, word)",
              ) {{word.Word}}

      .action-panel.bg-white.border-1.border-gray-300.p-2.absolute.rounded-md.flex(
        v-if="current",
      )
        input.rounded-md.border-2.border-gray-400.width-8(
          class="focus:border-blue-400 focus:ring-blue",
          v-model="current.text",
        )

        button.rounded-md.width-4.border-1.border-blue-300(
          type="button",
          @click="doCutOff",
        )


</template>

<script>
import axios from 'axios';
import {computed, onMounted, ref} from 'vue';
import {toHMS} from '@/utils/format';

export default {
  setup() {
    const isLoading = ref(true);
    const isSaving = ref(false);
    const isExporting = ref(false);
    const isExportingSubtitles = ref(false);
    const movieSrc = ref('');
    const title = ref('');
    const createdAt = ref('');
    const updatedAt = ref('');
    const page = ref(-1);
    const current = ref(null);
    let _sentences;

    const subtitles = computed(() => {
      if (page.value < 0) {
        return [];
      }

      return _sentences.slice(page.value, 20).map(item => {
        const {BeginTime, EndTime} = item;
        return {
          ...item,
          start: toHMS(BeginTime),
          duration: toHMS(EndTime - BeginTime),
        };
      });
    });

    const doCutOff = () => {

    };

    const doEdit = (event, word) => {
      if (word.text === undefined) {
        word.text = '';
      }
      current.value = word;
      const {target} = event;

    };

    const doExport = () => {

    };

    const doExportSubtitles = () => {

    };

    const doSave = async() => {
      isSaving.value = true;
      const {data} = await axios.post('/api/save');
      if (data.code !== 0) {
        alert(data.msg);
      }
      isSaving.value = false;
    };

    onMounted(async() => {
      const project = await axios.get('/api/project.json');
      const {
        movie,
        createdAt: c,
        updatedAt: u,
        rawResult,
      } = project.data;
      movieSrc.value = '/source/' + movie;
      title.value = movie;
      createdAt.value = c;
      updatedAt.value = u;
      isLoading.value = false;
      const {Sentences, Words} = rawResult;
      _sentences = Sentences;
      let wordIndex = 0;
      for (const sentence of Sentences) {
        let start = wordIndex;
        while (Words[wordIndex] && Words[wordIndex].BeginTime < sentence.EndTime) {
          wordIndex++;
        }
        sentence.words = Words.slice(start, wordIndex);
      }
      page.value = 0;
    });

    return {
      isLoading,
      isSaving,
      isExporting,
      isExportingSubtitles,

      movieSrc,
      title,
      createdAt,
      updatedAt,
      subtitles,
      current,

      doCutOff,
      doEdit,
      doExport,
      doExportSubtitles,
      doSave,
    };
  },
};
</script>
