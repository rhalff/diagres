import parse from './parse'
import glob from 'glob'
import fs from 'fs'
import Promise from 'bluebird'
import renderers from './render'
Promise.promisifyAll(fs)

export default function diagres(options = {
  pattern: '**/*.js',
  renderer: 'plantuml'
}) {
  const { [options.renderer]: renderer } = renderers
  const g = glob(options.pattern)
  const ren = renderer()
  const promises = []
  g.on('match', (file) => {
    promises.push(
      fs.readFileAsync(file, 'utf8').then((contents) => {
        const classes = parse(contents)
        ren.write(classes)
        return true
      })
    )
  })
  g.on('end', () => {
    Promise.all(promises).then(() => {
      ren.finish()
    }).catch((e) => {
      console.error(e.stack)
    })
  })
}
