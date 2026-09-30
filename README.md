# a11y-building-harness

Fail-closed **axe-core** scan of a **live URL**, plus compact APG cards over MCP. An automated pass is not WCAG conformance.

Requires **Node.js 22.18+** (see `.nvmrc`). Chromium is **not** in the npm tarball; install it once per machine: `npx playwright install chromium`.

Commands: `npx a11y-building-harness@0.1.0 --help`

```bash
npx a11y-building-harness@0.1.0 verify http://127.0.0.1:5173/
npx a11y-building-harness@0.1.0 verify --allow-remote https://example.com/
npx a11y-building-harness@0.1.0 get-blueprints modal button
```

`verify` defaults to loopback http(s). `--allow-remote` allows other http(s) hosts. `file:` and link-local/metadata hosts are always rejected. Exit codes: `0` clean, `1` violations or runtime error, `2` bad usage or disallowed URL.

### Cursor MCP

Pin the package version. Until it is on the registry, use the clone form.

```json
{
  "mcpServers": {
    "a11y-building-harness": {
      "command": "npx",
      "args": ["-y", "a11y-building-harness@0.1.0", "mcp"]
    }
  }
}
```

```json
{
  "mcpServers": {
    "a11y-building-harness": {
      "command": "node",
      "args": ["bin/cli.mjs", "mcp"],
      "cwd": "/absolute/path/to/a11y-building-harness"
    }
  }
}
```

Tool: `get_blueprints` (`button`, `modal`, `dialog`, …). MCP does not run `verify`.

## Publish (maintainers)

```bash
npm login
npm pack --dry-run
npm publish
```

If the name is taken, change `"name"` in `package.json`. After publish, pin `@0.1.0` (or later) in MCP config — do not use an unpinned `npx -y a11y-building-harness`.

## Demo app (this repo only)

Not in the npm tarball. `npm install && npx playwright install chromium && npm run dev`, then `verify` against `http://127.0.0.1:5173/`. `/` should pass the harness axe tags; `/broken` must fail (`image-alt`, `label`). `npm test` from a clone.
