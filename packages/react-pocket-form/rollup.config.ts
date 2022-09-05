import { terser } from 'rollup-plugin-terser'
import typescript from '@rollup/plugin-typescript'

export default {
  external: ['react'],
  input: 'dist/index.js',
  plugins: [
    typescript({
      tsconfig: 'tsconfig.build.json',
    }),
    terser(),
  ],
  output: [
    {
      globals: { react: 'React' },
      format: 'esm',
      file: 'lib/index.esm.mjs',
    },
    {
      globals: { react: 'React' },
      format: 'cjs',
      file: 'lib/index.cjs.js',
    },
  ],
}
