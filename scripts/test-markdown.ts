import {renderMarkdown} from '../src/lib/markdown';

const cases: [string, RegExp, string][] = [
  ['bold', /<strong>hello<\/strong>/, renderMarkdown('**hello**')],
  ['italic', /<em>world<\/em>/, renderMarkdown('*world*')],
  ['heading', /<h2>Title<\/h2>/, renderMarkdown('## Title')],
  ['list', /<ul><li>one<\/li><li>two<\/li><\/ul>/, renderMarkdown('- one\n- two')],
  ['link', /<a href="https:\/\/x.com"[^>]*>site<\/a>/, renderMarkdown('[site](https://x.com)')],
  ['image', /<img src="https:\/\/x.com\/a.png"[^>]*>/, renderMarkdown('![pic](https://x.com/a.png)')],
  ['youtube', /youtube-nocookie\.com\/embed\/abc123XYZ/, renderMarkdown('https://youtu.be/abc123XYZ')],
  ['escape', /&lt;script&gt;/, renderMarkdown('<script>alert(1)</script>')],
  ['no-js-link-stays-text', /^(?!.*<a href="javascript)/, renderMarkdown('[x](javascript:alert(1))')],
  ['no-onerror-attr', /^(?!.*onerror=")/, renderMarkdown('![x](https://x.com/a.png" onerror="alert(1))')],
];

let pass = 0;
for (const [name, re, out] of cases) {
  const ok = re.test(out);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` => ${out}`}`);
  if (ok) pass++;
}
console.log(`${pass}/${cases.length} passed`);
process.exit(pass === cases.length ? 0 : 1);
