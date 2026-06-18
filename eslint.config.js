import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
//import pluginReactConfig from "eslint-plugin-react/configs/jsx-runtime.js";
import stylistic from "@stylistic/eslint-plugin";

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  //pluginReactConfig,
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "@stylistic/indent": ["error", 2],
      "@stylistic/no-extra-semi": ["error"],
      "@stylistic/semi": ["error"],
      // ...
    },
  },
];
