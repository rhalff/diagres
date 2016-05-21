export default () => {
  let out = ''

  function write (classes) {
    for (const klass of classes) {
      out += `[${klass.name} |
`
      for (const prop of klass.properties) {
        // out += (prop.private ? '-' : '+') + `${prop.name}\n`
        out += `${prop.name}
`
      }
      out += '|'
      for (const method of klass.methods) {
        // out += (method.private ? '-' : '+') + method.name + '('
        out += method.name + '('
        if (method.params) {
          const params = []
          for (const param of method.params) {
            params.push(param.name)
          }
          out += params.join(', ')
        }
        out += ')\n'
      }
      out += ']\n'
      if (klass.superClass) {
        out += `[${klass.superClass}] <:--[${klass.name}]
`
      }
    }
  }

  function finish () {
    console.log(out)
  }

  return {
    write,
    finish
  }
}
