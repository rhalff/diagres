import {debug} from './util'

const esprima = require('esprima');

function compare(a, b) {
  if (a.name ===  b.name) {
    return 0
  }
  return a.name > b.name ? 1 : -1
}

export default function parse(src, options = {sort: true}) {
    let res;
    res = esprima.parse(src, {sourceType: 'module'});
  const classes = []

  function process(key, value, parent) {
    if (key === 'type' && value === 'ClassDeclaration') {
      processClass(parent)
    }
  }

  function traverse(parent, func) {
    for (const i in parent) {
      func.apply(this, [i, parent[i], parent]);
      if (parent[i] !== null && typeof parent[i] === 'object') {
        traverse(parent[i], func);
      }
    }
  }

  function processClass(section) {
    if (section.type === 'ClassDeclaration') {
      let c_class = {
        name: section.id.name,
        methods: [],
        properties: []
      };
      if (section.superClass) {
        c_class.superClass = section.superClass.name
      }
      const { body: { body: methods } } = section
      for (let method of methods) {
        if (method.type === 'MethodDefinition') {
          const c_method = {
            name: method.key.name,
            private: method.key.name[0] === '_',
            params: []
          }

          if (c_method.name === 'constructor') {
            // collect properties first.
            const ctorBody = method.value.body.body
            for (const exp of ctorBody) {
              if (exp.type === 'ExpressionStatement' &&
                exp.expression.type === 'AssignmentExpression' &&
                exp.expression.left.object.type === 'ThisExpression'
              ) {
                c_class.properties.push({
                  name: exp.expression.left.property.name,
                  private: exp.expression.left.property.name[0] === '_'
                })
              }
            }
          }

          const {
            value: {
              params: params,
              defaults: defaults
              }
            } = method
          if (params) {
            for (let [idx, param] of params.entries()) {
              const c_param = {}
              c_param.name = param.name
              if (defaults[idx] !== undefined) {
                // TODO: get type etc.
              }
              c_method.params.push(c_param)
            }
          }
          c_class.methods.push(c_method)
        }
      }
      debug(
        'Class: %s, Methods: %d, Properties: %d',
         c_class.name,
         c_class.methods.length,
         c_class.properties.length
      )

      if (options.sort) {
        c_class.methods.sort(compare)
        c_class.properties.sort(compare)
      }
      classes.push(c_class)
    }
  }

  traverse(res, process)

  return classes
}
