import parse from './parse'
import glob from 'glob'
import fs from 'fs'
import Promise from 'bluebird'
import renderers from './render'
import {debug} from './util'
Promise.promisifyAll(fs)

export default function diagres(options = {
  pattern: '**/*.js',
  renderer: 'plantuml',
  sort: true
}) {
  const { [options.renderer]: renderer } = renderers
  debug('Using pattern: %s', options.pattern)
  const g = glob(options.pattern)
  const ren = renderer()
  const promises = []
  g.on('match', (file) => {
    debug('Process: %s', file)
    promises.push(
      fs.readFileAsync(file, 'utf8').then((contents) => {
          let classes;
          try {
              classes = parse(contents, {sort: options.sort})
          } catch (error) {
              console.error('Failed to parse source: ' + file);
              return;
          }
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
