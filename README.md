# Create React Chrome Extension

## Quick Overview

```sh
npx create-react-chrome-extension my-extension
cd my-extension
yarn start
```

Then turn on Developer Mode in Chrome and pick `my-extension/build` to load the extension.

### Get Started Immediately

You **don’t** need to install or configure tools like Webpack or Babel.<br>
They are preconfigured and hidden so that you can focus on the code.

Just create a project, and you’re good to go.

## Requirements

* Node 8.x
* Yarn

## Commands

### `yarn start`

Builds the extension in development mode.<br>

All entry points (except background.html) will automatically reload if you make changes to the code.<br>

### `yarn build`

Builds the extension for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

### `yarn generate`

Simple scaffolding CLI to generate entry points for your extension (background, page_action, browser_action, options, etc.)