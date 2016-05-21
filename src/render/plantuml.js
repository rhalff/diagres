export default () => {
  // console.log(JSON.stringify(classes, null, 2))
  let out = '@startuml\n\n'

  function write (classes) {
    for (const klass of classes) {
      out += `class ${klass.name} {
`
      for (const prop of klass.properties) {
        out += (prop.private ? '-' : '+') + `${prop.name}
`
      }
      for (const method of klass.methods) {
        out += (method.private ? '-' : '+') + method.name + '('
        if (method.params) {
          const params = []
          for (const param of method.params) {
            params.push(param.name)
          }
          out += params.join(', ')
        }
        out += ')\n'
      }
      out += '}\n'
      if (klass.superClass) {
        out += `${klass.superClass} <|- ${klass.name}
`
      }
    }
  }

  function finish () {
    out += '@enduml'
    console.log(out)
  }

  return {
    write,
    finish
  }
}
