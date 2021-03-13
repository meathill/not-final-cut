<template lang="pug">
nav.bg-blue-500.text-white.flex.py-2.items-center.px-3
  .navbar-brand.text-xl
    strong N
    small.text-blue-200 ot
    strong.ml-1 F
    small.text-blue-200 inal
    strong.ml-1 C
    small.text-blue-200 ut

  .mx-auto
    strong {{title}}

  transition(
    name="alert-transition",
    enter-active-class="animated slideInDown",
    leave-active-class="animated slideOutUp",
  )
    .alert.py-2.px-3.m-3.rounded-md.mr-3(
      v-if="message",
      :class="status === true ? 'bg-green-300' : 'bg-red-300'",
    ) {{message}}

  .action-bar.flex.text-sm
    button.px-3.rounded.bg-green-500.leading-9.transition(
      class="hover:bg-green-600",
      type="button",
      @click="doSave",
      :disabled="isSaving",
    )
      i.bi.bi-spin.animate-spin.mr-2(v-if="isSaving")
      i.bi.bi-check.mr-2(v-else)
      | 保存项目 (
      span.underline S
      | )

    button.px-3.rounded.bg-blue-600.ml-2.leading-9.transition(
      class="hover:bg-blue-700",
      type="button",
      @click="doExport",
      :disabled="isExporting",
    )
      i.bi.bi-spin.animate-spin.mr-2(v-if="isExporting")
      i.bi.bi-file-earmark-play-fill.mr-2(v-else)
      | 导出视频 (
      span.underline E
      | )

    button.px-3.rounded.bg-indigo-500.ml-2.leading-9.transition(
      class="hover:bg-indigo-600",
      type="button",
      @click="doExportSubtitles",
      :disabled="isExportingSubtitles",
    )
      i.bi.bi-spin.animate-spin.mr-2(v-if="isExportingSubtitles")
      i.bi.bi-file-earmark-font-fill.mr-2(v-else)
      | 导出字幕 (
      span.underline T
      | )

.bi.bi-spin.text-7xl.mx-auto.my-5.mx-auto(v-if="isLoading")

#main-content.flex.flex-1(v-else)
  .bg-black.flex-1.flex
    video.w-full(
      :src="movieSrc",
      controls,
    )

  .w-96.relative.overflow-auto
    header.flex.items-center.px-3
      h2.text-lg.text-bold.py-4 调整字幕
      .help.ml-auto.text-gray-500.text-sm 点击编辑，右键隐藏
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
            template(v-for="word in item.words")
              span.px-1.cursor-pointer.border-2.border-transparent(
                class="hover:border-red-400",
                :class="[{'line-through text-gray-300': word.off}, word.isEdit ? 'hidden' : 'inline-block']",
                @click="doEdit(word, $event)",
                @contextmenu.prevent="doToggle(word)",
              ) {{word.text || word.Word}}
              input.rounded-md.border.px-1.inline-block.mx-1.subtitle-input(
                v-if="word.isEdit",
                v-model="word.text",
                @blur="doAcceptWord(word)",
                @keydown.esc="doCancelEdit(word)",
                @keydown.enter="doAcceptWord(word)",
                :style="'width:' + word.Word.length + 'em'",
              )
</template>

<script>
import axios from 'axios';
import {
  computed,
  reactive,
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from 'vue';
import {toHMS} from '@/utils/format';
import {isMac} from "@/utils/helper";

export default {
  setup() {
    const isLoading = ref(true);
    const isSaving = ref(false);
    const isExporting = ref(false);
    const isExportingSubtitles = ref(false);
    const status = ref(null);
    const message = ref('');
    const movieSrc = ref('');
    const title = ref('');
    const createdAt = ref('');
    const updatedAt = ref('');
    const page = ref(-1);
    let _sentences;
    let _project;

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

    const doToggle = (word) => {
      word.off = !word.off;
    };

    const doEdit = async (word, event) => {
      if (word.text === undefined) {
        word.text = word.Word;
      }
      word.isEdit = true;
      const {target} = event;
      await nextTick();
      const input = target.nextElementSibling;
      input.focus();
      input.select();
    };

    const doAcceptWord = word => {
      word.Word = word.text;
      word.isEdit = false;
    };
    const doCancelEdit = word => {
      word.text = word.Word;
      word.isEdit = false;
    };

    const doExport = () => {

    };

    const doExportSubtitles = () => {

    };

    const doSave = async() => {
      if (isSaving.value) {
        return;
      }
      status.value = message.value = null;
      isSaving.value = true;
      try {
        const {data} = await axios.post('/api/save', {
          ..._project,
          rawResult: {
            Sentences: _sentences,
          },
        });
        if (data.code !== 0) {
          message.value = data.message;
        } else {
          status.value = true;
          message.value = '保存成功';
        }
      } catch (e) {
        message.value = e.message;
      }
      isSaving.value = false;
    };

    const onKeyDown = event => {
      const {key, metaKey, ctrlKey} = event;
      if (!(isMac ? metaKey : ctrlKey)) {
        return;
      }
      if (/[set]/i.test(key)) {
        event.preventDefault();
      }
      switch (key) {
        case 's':
          doSave();
          break;

        case 'e':
          doExport();
          break;

        case 't':
          doExportSubtitles();
          break;
      }
    }

    onMounted(async() => {
      const project = await axios.get('/api/project.json');
      const {
        movie,
        createdAt: c,
        updatedAt: u,
        rawResult,
        ...rest
      } = project.data;
      movieSrc.value = '/source/' + movie;
      title.value = movie;
      createdAt.value = c;
      updatedAt.value = u;
      isLoading.value = false;
      const {Sentences, Words} = rawResult;
      if (Words) {
        let wordIndex = 0;
        for (const sentence of Sentences) {
          let start = wordIndex;
          while (Words[wordIndex] && Words[wordIndex].BeginTime < sentence.EndTime) {
            wordIndex++;
          }
          sentence.words = Words.slice(start, wordIndex);
        }
      }
      _sentences = reactive(Sentences);
      page.value = 0;
      _project = {
        movie,
        createdAt: c,
        updatedAt: u,
        ...rest
      };

      document.body.addEventListener('keydown', onKeyDown);
    });
    onBeforeUnmount(() => {
      document.body.removeEventListener('keydown', onKeyDown);
    });

    return {
      isLoading,
      isSaving,
      isExporting,
      isExportingSubtitles,
      status,

      message,
      movieSrc,
      title,
      createdAt,
      updatedAt,
      subtitles,

      doToggle,
      doEdit,
      doAcceptWord,
      doCancelEdit,
      doExport,
      doExportSubtitles,
      doSave,
    };
  },
};
</script>
