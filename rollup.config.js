import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'
import commonjs from 'rollup-plugin-commonjs'
const extensions = ['.js', '.jsx', '.ts', '.tsx']

module.exports = {
  input: './src/index.ts',
  output: {
    file: './dist/index.js',
    format: 'umd',
    sourcemap: false,
    name: 'ReactSmoothDnD',
    globals: {
      '@cisdi/smooth-dnd': 'SmoothDnD',
      react: 'React',
      'prop-types': 'PropTypes',
    },
  },
  external: ['@cisdi/smooth-dnd', 'react', 'prop-types'],
  plugins: [
    babel({
      extensions,
      include: ['./index.ts', 'src/**/*'],
      exclude: 'node_modules/**',
    }),
    commonjs({
      extensions,
    }),
    uglify(),
  ],
}
