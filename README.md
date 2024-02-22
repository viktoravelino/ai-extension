# AI Extension

## Getting Started

First, install dependencies and build the project:

```bash
npm install && npm run build
```

This will create a `/dist` directory that can you can add to Chrome as an extension. The `manifest.json` links `src/main.tsx` to the generated `index.html`

Second, start developing:

```bash
npm run dev:extension
```

You can start editing the extension by modifying the files within `/src` or any file in `/public`. The extension will automatically re-build as you make changes.

## Add extension to chrome

Open the Extension Management page by navigating to `chrome://extensions`. Enable Developer Mode by clicking the toggle switch next to Developer mode. Click the Load unpacked button and select the `/dist` directory.

## Learn More

To learn more about extensions, take a look at the following resources:

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
