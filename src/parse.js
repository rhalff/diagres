const esprima = require('esprima');

export default function parse(src) {

  const res = esprima.parse(src, {sourceType: 'module'});
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
      classes.push(c_class)
    }
  }

  traverse(res, process)

  return classes
}
