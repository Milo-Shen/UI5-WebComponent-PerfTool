# UI5-WebComponent-PerfTool
The tool that used to measure the performance of ui5 webcomponents 

## Usage
Go to link: [https://milo-shen.github.io/UI5-WebComponent-PerfTool/](https://milo-shen.github.io/UI5-WebComponent-PerfTool/)
The lighthouse scores of ui5-webcomponents will be listed in the above website.
![snapshot](./docs/snapshot.PNG)

## How to update the github perf page
In order to update the  [https://milo-shen.github.io/UI5-WebComponent-PerfTool](https://milo-shen.github.io/UI5-WebComponent-PerfTool/) page, we just update the version of `@ui5/webcomponents` and `@ui5/webcomponents-fiori` in `package.json` file.
Then submit it to the main branch, CI will run automatically, and rerun all the lighthouse tests for ui5-webcomponents.
