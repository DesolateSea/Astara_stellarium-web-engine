import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'

test('actual C sky-label formatter translates raw tile names as well as NAME aliases', () => {
  const directory = mkdtempSync('/tmp/opencode/astara-engine-labels-')
  try {
    // Compile the production formatter, isolating only its platform/logging
    // dependencies. This catches renderer bugs that JS-only catalog tests miss.
    const source = readFileSync(new URL('../../../src/designation.c', import.meta.url), 'utf8')
      .replace('#include "swe.h"', `
#include <assert.h>
#define ARRAY_SIZE(a) (sizeof(a) / sizeof((a)[0]))
#define LOG_W_ONCE(...) ((void)0)
#define EMSCRIPTEN_KEEPALIVE
#define COMPILE_TESTS 0
const char *sys_translate(const char *domain, const char *text);
`)
    const harness = `
const char *sys_translate(const char *domain, const char *text) {
    if (strcmp(domain, "sky") == 0) {
        if (strcmp(text, "Arcturus") == 0) return "Arktur";
        if (strcmp(text, "Polaris") == 0) return "Polarstern";
        if (strcmp(text, "Spica") == 0) return "角宿一";
    }
    if (strcmp(domain, "constellation") == 0 && strcmp(text, "Corvi") == 0) return "Rabe";
    if (strcmp(domain, "greek") == 0 && strcmp(text, "Beta") == 0) return "β";
    return text;
}
int main(void) {
    char out[128];
    const char *inputs[] = {"Arcturus", "NAME Arcturus", "Polaris", "NAME Polaris", "Spica", "NAME Spica", "HIP 69673", "NGC 123"};
    const char *expected[] = {"Arktur", "Arktur", "Polarstern", "Polarstern", "角宿一", "角宿一", "HIP 69673", "NGC 123"};
    for (int i = 0; i < ARRAY_SIZE(inputs); i++) {
        designation_cleanup(inputs[i], out, sizeof(out), DSGN_TRANSLATE);
        assert(strcmp(out, expected[i]) == 0);
    }
    designation_cleanup("Arcturus", out, sizeof(out), 0);
    assert(strcmp(out, "Arcturus") == 0);
    designation_cleanup("* bet Crv", out, sizeof(out), DSGN_TRANSLATE | BAYER_LATIN_LONG | BAYER_CONST_LONG);
    assert(strcmp(out, "β Rabe") == 0);
    designation_cleanup("* 12 Crv", out, sizeof(out), DSGN_TRANSLATE | BAYER_CONST_LONG);
    assert(strcmp(out, "12 Rabe") == 0);
    return 0;
}
`
    const file = join(directory, 'formatter.c')
    const binary = join(directory, 'formatter')
    writeFileSync(file, source + harness)
    const include = fileURLToPath(new URL('../../../src', import.meta.url))
    const compiled = spawnSync('cc', ['-std=gnu11', '-I', include, file, '-o', binary], { encoding: 'utf8' })
    assert.equal(compiled.status, 0, compiled.stderr || compiled.error?.message)
    const result = spawnSync(binary, [], { encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
  } finally { rmSync(directory, { recursive: true }) }
})
