GitHub Release flow (since 2026-10-17)
---------------------------------------
The download buttons on download.html no longer look for files in this
folder - they read the repo's latest GitHub Release automatically:

  API     : https://api.github.com/repos/quasarbrowser/quasarbrowser.github.io/releases/latest
  assets  : Quasar Browser Setup.exe   (installer, ~461 MB)
            Quasar Browser.void        (portable payload, ~461 MB)

To publish a build:
  1. Assets live in <project>\setups\ (build them with qsbuild scripts)
  2. GitHub -> repo -> Releases -> Draft a new release (tag e.g. v1.0.0)
  3. Upload BOTH files keeping the EXACT names (spaces included)
  4. Paste setups\RELEASE_NOTES.md as the description (update hashes if rebuilt)
  5. Publish - the site picks it up automatically (meta is cached ~10 min)

Notes:
  - Never commit build files here: GitHub blocks files over 100 MB, and
    releases are the right place for the ~461 MB assets.
  - Keep no personal data in this folder or anywhere on the site.

Current live channel (2026-10-18):
  The Full Package zip is hosted on archive.org (sha1 verified identical to
  setups\Quasar Browser.zip):
    https://archive.org/download/quasar-browser/Quasar%20Browser%20.zip
  (note the SPACE inside the file name: "Quasar Browser .zip")
  download.html points there until the first GitHub release exists; then the
  release asset wins automatically.
