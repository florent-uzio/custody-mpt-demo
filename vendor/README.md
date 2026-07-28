# vendor/ — temporary xrpl.js builds for confidential MPTs

These tarballs are local `npm pack` outputs of the **unreleased**
[`XRPLF/xrpl.js@confidential-mpts`](https://github.com/XRPLF/xrpl.js/tree/confidential-mpts)
branch, at commit `63af7e9`. They exist only so this app can use the XLS-96
confidential-MPT surface before XRPLF publishes it to npm.

| Tarball                                                     | Source package                 |
| ----------------------------------------------------------- | ------------------------------ |
| `xrpl-5.0.0-confidential-mpts.63af7e9.tgz`                  | `packages/xrpl`                |
| `ripple-binary-codec-2.8.0-confidential-mpts.63af7e9.tgz`   | `packages/ripple-binary-codec` |

## Why both packages

The branch does not bump any version numbers — `xrpl` is still `5.0.0` and
`ripple-binary-codec` is still `2.8.0` — but `ripple-binary-codec`'s
`definitions.json` gains 5 transaction types (`ConfidentialMPTClawback`,
`ConfidentialMPTConvert`, `ConfidentialMPTConvertBack`,
`ConfidentialMPTMergeInbox`, `ConfidentialMPTSend`) and 18 fields. Installing
only `xrpl` would resolve `ripple-binary-codec@2.8.0` from the registry and
silently fail to serialize any confidential transaction, so `package.json`
pins it through an `overrides` entry.

`@xrplf/mpt-crypto` (the WASM proof/ElGamal package) is **not** vendored. It is
an optional peer dependency that `xrpl` lazily imports only from the
`xrpl/confidential` subpath, which this app does not use. Add it here if
client-side proof generation is ever needed.

`@florent-uzio/custody` bundles its own copy of these same forked builds via
`bundleDependencies`, so the SDK's internal use is already covered. This
directory covers the app's *direct* `xrpl` imports (`app/lib/batch-builder.ts`,
`app/_actions/batch.ts`, `app/_actions/trustset.ts`, `app/_actions/clawback.ts`).

## Reproducing

```sh
git clone --branch confidential-mpts --single-branch https://github.com/XRPLF/xrpl.js.git
cd xrpl.js && git checkout 63af7e9
npm ci && npx lerna run build --stream
npm pack --workspace ripple-binary-codec --workspace xrpl --pack-destination <repo>/vendor
# then rename each tarball with the -confidential-mpts.<sha> suffix
```

## Removing

When XRPLF ships this (likely as a `confidential-mpts-experimental` dist-tag,
as was done for `batch-experimental`), delete this directory, drop the
`overrides` block from `package.json`, and restore `"xrpl": "^<version>"`.
