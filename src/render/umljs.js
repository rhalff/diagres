import { JSONFactory, GraphvizDot } from 'uml.js'

export default () => {
  const diagram = {
    type: 'ClassDiagram',
    classes: [],
    links: []
  }

  function write (classes) {
    for (const klass of classes) {
      const _class = {
        name: klass.name,
        properties: [],
        methods: []
      }

      for (const prop of klass.properties) {
        _class.properties.push({
          visibility: prop.private ? '-' : '+',
          variable: {
            name: prop.name
            // type: null
          }
        })
      }
      for (const method of klass.methods) {
        const _method = {
          variable: {
            visibility: method.private ? '-' : '+',
            name: method.name
            // type: null
          }
        }

        if (method.params) {
          _method.arguments = []
          for (const param of method.params) {
            _method.arguments.push({
              name: param.name
              // type: null
            })
          }
          _class.methods.push(_method)
        }
      }
      diagram.classes.push(_class)
      if (klass.superClass) {
        diagram.links.push({
          type: 'aggregation', // || generalization
          first: {name: klass.superClass},
          second: {name: klass.name}
          // description: ''
          // head_description: ''
          // tail_description: ''
        })
      }
    }
  }

  function finish () {
    const jf = new JSONFactory()
    const doc = jf.buildDiagram(diagram)
    const dot = new GraphvizDot(doc)
    console.log(dot.export())
  }

  return {
    write,
    finish
  }
}
