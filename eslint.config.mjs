import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: ["public/sw.js", "public/sw.js.map", "public/swe-worker-*.js"] },
  ...nextVitals,
  ...nextTs,
];

export default eslintConfig;
