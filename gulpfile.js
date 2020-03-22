const path = require('path')
const { src, dest, parallel, watch, series } = require('gulp')
const ts = require('gulp-typescript')
const clean = require('gulp-clean')
const program = require('commander')

// enum of mode
const MODE = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development'
}

program.option('-m, --mode <type>', 'choose compile mode', MODE.PRODUCTION)
program.parse(process.argv)

const tsProject = ts.createProject('tsconfig.json')
const programArgv = program.opts()
const output = path.resolve(__dirname, 'dist')
const buildTaskQueue = []

const typeScript = () => src(['src/**/*.ts'])
  .pipe(tsProject())
  .pipe(dest(output))
buildTaskQueue.push(exports.tsTask = typeScript)

const wxml = () => src(['src/**/*.wxml'])
  .pipe(dest(output))
buildTaskQueue.push(exports.wxmlTask = wxml)

const wxss = () => src(['src/**/*.wxss'])
  .pipe(dest(output))
buildTaskQueue.push(exports.wxssTask = wxss)

const json = () => src(['src/**/*.json'])
  .pipe(dest(output))
buildTaskQueue.push(exports.jsonTask = json)

const buildTask = (exports.buildTask = parallel(buildTaskQueue))

const cleanFile = () => src(output).pipe(clean())
const cleanTask = (exports.cleanTask = cleanFile)

const watchFile = () => watch(['src/**'], buildTask)
const watchTask = (exports.watchTask = watchFile)

const taskQueue = programArgv.mode === 'production'
  ? [buildTask]
  : [buildTask, watchTask]

if (require('fs').existsSync(output)) taskQueue.unshift(cleanTask)

exports.default = series(taskQueue)
