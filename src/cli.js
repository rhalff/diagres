import {version} from '../package'
import program from 'commander'
import diagres from './diagres'
import renderers from './render'
const types = Object.keys(renderers)

program
  .version(version)
  .option('-p, --pattern [pattern]', 'File globbing pattern')
  .option('-r, --renderer [type]', 'Output format: ' + types.join(', '), 'plantuml')
  .parse(process.argv)

if (!program.pattern) {
  console.log('Globbing pattern required')
} else {
  diagres({
    pattern: program.pattern,
    renderer: program.renderer
  })
}
