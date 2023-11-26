# remark-svelte-auto-import

[![Build][build-badge]][build]
[![StandWithUkraine][ukraine-svg]][ukraine-readme]

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Usage](#usage)
* [Configuration](#configuration)
* [Examples](#examples)
* [Contributing](#contributing)
* [Thanks](#thanks)
* [License](#license)


## What is this?

This plugin is part of the [remark] plugin infrastructure and meant to be used in conjunction with [mdsvex].
_mdsvex_ allows to use [Markdown] to write your pages within the [Svelte] framework. 
Obviously it's nice to use components within these _Markdown_ files which is support but requires to add the corresponding import into the _Markdown_ file.
For instance:

```html
<script>
    import { Chart } from '@chartfactory';
</script>
# Title

Here is my Chart:

<Chart />
```

Though feasible the __script__ tag is somewhat annoying here as it's only reason for existence is to satisfy technical requirements.
This is where this plugin __remark-svelte-auto-import__ comests into action. 
It integrates with the _remark_ infrastructure and generates these imports.
Using it would change the above section to this one:

```html
# Title

Here is my Chart:

<Chart />
```

## When should I use this?

This plugin is meant to be used in conjunction with _mdsvex_ and only needed if you intend to use _Svelte_ components within your _Markdown_.


## Install

This package is [ESM only][esmonly]. In Node.js (version 18+), install with [pnpm]:

```js
pnpm install @kasisoft/remark-svelte-auto-import
```


## Usage

* Setup your _Svelte_ project and install _mdsvex_ (see [mdsvexdocs])
* Your project will now contain a file named __mdsvex.config.js__.
    * Import the plugin:
        ```js
        import { remarkSvelteAutoImport } from '@kasisoft/remark-svelte-auto-import';
        ```
    * Update the array of _remark_ plugins without a configuration:
        ```js
        const config = defineConfig({
            ...
            remarkPlugins: [remarkSvelteAutoImport],
            ...
        });
        ```
    * with a configuration (note: each entry is a list here):
        ```js
        const myconfig = {...DEFAULT_OPTIONS, debugComponentMap: true};
        const config = defineConfig({
            ...
            remarkPlugins: [
                [remarkSvelteAutoImport, myconfig]
            ],
            ...
        });
        ```

### Configuration

The configuration is fully typed using [Typescript].
__RemarkSvelteAutoImportOptions__ is defined as followed:

```typescript
export interface RemarkSvelteAutoImportOptions {
    
    debug              : Debug; /* Debug.{None, Default, ComponentMap, RootBefore, RootAfter} */
    
    /* generate ts lang attribute for non existent script nodes */
    scriptTS?           : boolean;

    /* scan for components */
    directories?       : string[];
    patterns?          : string[];
    
    /* alternatively/additionally provide a mapping between components and modules  */
    componentMap?      : {[component: string]: string};

    /* mapping for local components (unless mapped in componentMap) */
    localComponents?   : {[pathPrefix: string]: string};

} /* ENDINTERFACE */
```

You can import import the default settings __DEFAULT_OPTIONS__ with the following setup:

```typescript
export const DEFAULT_OPTIONS: RemarkSvelteAutoImportOptions = {
    debug               : Debug.None,
    scriptTS            : true,
    directories         : [
        'node_modules/'
    ],
    patterns            : [
        '**/*.svelte'
    ]
};
```
* __debug__ : Debug - Combine flags of __Debug__ in order to generate debug statements:
  * Debug.None: no output (just a convenience value)
  * Debug.Default: some basic output
  * Debug.ComponentMap: prints out the component map configuration identified through the transformation process
  * Debug.RootBefore: prints the ast before the transformation
  * Debug.RootAfter: prints the ast after the transformation
  * Debug.All: enables all outputs (convenience value)
* __debugComponentMap__ : boolean - Print out information of the identified components. Be aware that depending on your project this might be a big map which will be printed as a JSON string.
* __debugRootBefore__ : boolean - Prints the root node before the transformation takes place.
* __debugRootAfter__ : boolean - Prints the root node after the transformation successfully took place.
* __scriptTS__ : boolean - By default a ```lang="ts"``` will be added to each create __script__ tag. If set to __false__ this won't happen.
* __directories__ : string[] - A list of directories to parse for svelte components.
* __patterns__ : string[] - A list of patterns to identify svelte components.  
* __componentMap__ : {[component: string]: string} - A map that allows to specify the components and their respective modules. If you configure this by yourself you can use empty __directories__ and __patterns__. If you additionally scan for components this __componentMap__ will override the scanned settings.
* __localComponents__ : {[pathPrefix: string]: string} - A map of path prefixes used to map the location of the components.


## Examples

If all components you are using are provided though npm dependencies you can just add the _node_modules_ directory to the configuration:

```javascript
const config = {
    ...
    directories         : [
        'node_modules/'
    ],
    patterns            : [
        '**/*.svelte'
    ]
    ...
}
```
Let's say you have the component __Alert__ from the [flowbite svelte][flowbite-alert] this will cause
an import such as this:

```javascript
<script>
    import { Alert } from 'flowbite-svelte';
</script>
```

However if you intend to use your own components you need to provide a corresponding mapping to refer
to such a component. Let's say you have a component __Garlic__ within __src/lib/components/Garlic.svelte__ you to provide a corresponding path mapping such as this:

```javascript
const config = {
    ...
    localComponents: {
        'src/lib': '$lib'
    }
    ...
}
```

This causes the location __src/lib/components/Garlic.svelte__ to be mapped to __$lib/components/Garlic__ resulting in this script:

```javascript
<script>
    import { Garlic } from '$lib/components/Garlic';
</script>
```

## Contributing

If you want to contribute I'm happy for any kind of feedback or bug reports.
Please create issues and pull requests as you like but be aware that it may take some time
for me to react.


## Thanks

* [Svelte] - For providing a great, fast and easy comprehensible framework.
* [MSDVEX][mdsvex] - For the nice intergration of _Markdown_ in _Svelte_
* [remark] - For a great platform to modify/transform the content.


## License

[MIT][license] © [Kasisoft.com](https://kasisoft.com) - <daniel.kasmeroglu@kasisoft.com>


<!-- Definitions -->

[build]: https://github.com/kasisoft/remark-svelte-auto-import/actions
[build-badge]: https://github.com/kasisoft/remark-svelte-auto-import/actions/workflows/rsai.yml/badge.svg
[esmonly]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
[flowbite-alert]: https://flowbite-svelte.com/docs/components/alert
[license]: https://github.com/kasisoft/remark-svelte-auto-import/blob/main/license
[markdown]: https://markdown.de/
[mdsvex]: https://mdsvex.com
[mdsvexdocs]: https://mdsvex.com/docs
[pnpm]: https://pnpm.io/
[remark]: https://github.com/remarkjs
[svelte]: https://svelte.dev/
[typescript]: https://www.typescriptlang.org/
[ukraine-readme]: https://github.com/vshymanskyy/StandWithUkraine/blob/main/docs/README.md
[ukraine-svg]: https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg
