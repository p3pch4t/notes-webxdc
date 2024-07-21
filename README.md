# WebXDC Notes

Notes app with support for WebXDC application format.

## Features

- GFM Markdown support
- Live preview of notes while editing
- Folders to categorize notes
- View history of notes
- Mentions + View of notes you've been mentioned in
- Export notes to Markdown, HTML, PDF (As well as export whole folders to zipped archives)
- Import from Txt/Markdown (As well as zipped archives with these formats)

## Development

Use [pnpm](https://pnpm.io/) package manager

- `pnpm dev` – run dev server
- `pnpm build` – build app into `build/` directory, automatically generates
  `.xdc` file as well
  - It requires `zip` to be installed in order to generate `.xdc` file

## License

This code is licensed under GPLv3
