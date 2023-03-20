# VUE CLI Plugin: Dependency Dist Copy

Plugin copies all files from dependencies to distribution folder. It's especially useful for copying dependencies' chunks to current distribution. This way you can use dependencies that use dynamic imports.

## Config

```js
pluginOptions: {
    dependencyDistCopy: {
        "<dependency-name>": [{
            root: '<path-to-dependency-dist-folder>',
            pattern: '*.js(.map)?'
        }]
    }
}
```
