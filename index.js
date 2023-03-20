const CopyPlugin = require('copy-webpack-plugin')
const { globSync } = require('glob')
const path = require('path');

module.exports = (api, { pluginOptions }) => {
    const depsCopy = {
        webpackCopy: [],
        devAlias: {
            match: [],
            send: []
        }
    }
    if ('dependencyDistCopy' in pluginOptions) {
        for (let dep in pluginOptions.dependencyDistCopy) {
            for (let depCpOpt of pluginOptions.dependencyDistCopy[dep]) {
                const pathRoot = depCpOpt.root
                const pathPattern = depCpOpt.pattern
                const pathFull = path.join(pathRoot, pathPattern)

                // Add to webpack config
                depsCopy.webpackCopy.push(
                    { from: pathFull, to: '[name][ext]' }
                )

                // Build array of files to match against
                const files = globSync(pathFull)
                for (let f in files) {
                    const file = files[f]
                    depsCopy.devAlias.match.push(file.replace(pathRoot, '').replace(/^[\/\\]+/, ''))
                    depsCopy.devAlias.send.push(path.join(process.cwd(), file))
                }
            }
        }
    }
    
    // Webpack
    if (depsCopy.webpackCopy.length > 0) {
        api.chainWebpack(webpackConfig => {
            webpackConfig
                .plugin('copy-webpack-plugin')
                .use(CopyPlugin, [
                    {
                        patterns: depsCopy.webpackCopy
                    }
                ])
        })
    }

    // Dev
    api.configureDevServer(app => {
        app.use((req, res, next) => {
            // Dev serves all JS files form "js" subfolder
            // Remove the subfolder to match against the file
            const match = depsCopy.devAlias.match.indexOf(req.originalUrl.replace(/^[\/\\]?js[\/\\]+/, ''))
            if (match >= 0) {
                res.sendFile(depsCopy.devAlias.send[match])
            } else { 
                next()
            }
        });
    })
}