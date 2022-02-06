module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
  ],
  plugins: [
    'babel',
    'vue',
  ],
  globals: {
    withDefaults: true,
    defineProps: true,
    defineEmits: true,
    defineExpose: true,

    Nullable: true,
    Timeout: true,

    $root: true,
  },
  "rules": {
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
  },
}
