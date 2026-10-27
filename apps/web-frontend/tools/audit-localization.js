// Read-only audit of visible static Vue template text. Dynamic labels and services
// require separate review; scientific citations and proper names are reported too.
const fs = require('fs')
const path = require('path')
const compiler = require('vue-template-compiler')
const root = path.resolve(__dirname, '..')
let count = 0

function report (file, text) {
  count++
  console.log(path.relative(root, file) + ': ' + text)
}

function walk (node, file, parent = {}) {
  if (node.type === 3 && !node.isComment && parent.tag !== 'v-icon') {
    const text = node.text.trim().replace(/\s+/g, ' ')
    if (/[A-Za-z]{2}/.test(text) && !/^(mdi-|https?:|km$|Astara$|Stellarium Web Engine$)/.test(text)) report(file, text)
  }
  for (const attr of node.attrsList || []) {
    // Empty-state props intentionally contain translation keys; ResultsList translates them.
    if (/^(title|subtitle|label|placeholder|alt|aria-label|hint|text)$/.test(attr.name) && /[A-Za-z]{2}/.test(attr.value)) report(file, attr.name + '=' + attr.value)
  }
  for (const child of node.children || []) walk(child, file, node)
  for (const condition of (node.ifConditions || []).slice(1)) walk(condition.block, file, parent)
}

function visit (directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) { visit(file); continue }
    if (!file.endsWith('.vue')) continue
    const source = fs.readFileSync(file, 'utf8')
    const template = compiler.parseComponent(source, { deindent: false }).template
    if (!template) continue
    const ast = compiler.compile(template.content, { outputSourceRange: true }).ast
    if (ast) walk(ast, file)
  }
}
visit(path.join(root, 'src'))
console.log(count + ' static strings to review (also inspect dynamic expressions and services).')
