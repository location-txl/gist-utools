console.log("preload.js loaded")
window.api = {
    platform: {
        isDarkMode: () => {
            return window.matchMedia('(prefers-color-scheme: dark)').matches
        },
        registerDarkModeListener: (callback) => {
            window.matchMedia('(prefers-color-scheme: dark)')
                .addEventListener('change', event => {
                    if (event.matches) {
                        callback(true)
                    } else {
                        callback(false)
                    }
                })
        },
        openUrl: (url) => {
            utools.shellOpenExternal(url)
        },
        debug: utools.isDev(),
    },
   
}











