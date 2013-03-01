// fileLoader (processing code)
;(function($, ns, undefined){

    ns.read = function(files, settings){
        ns.reader = new FileReader()

        // Settings
        if(settings.onerror === undefined)
            ns.reader.onerror = ns.errorHandler
        else
            ns.reader.onerror = settings.onerror

        if(settings.onprogress === undefined)
            ns.reader.onprogress = function(evt) {
                console.log('file loader: progress ', evt)
            }
        else
            ns.reader.onprogress = settings.onprogress

        if(settings.onabort === undefined)
            ns.reader.onabort = function(e) {
                alert('File read cancelled')
            }
        else
            ns.reader.onabort = settings.onabort

        if(settings.onloadstart === undefined)
            ns.reader.onloadstart = function(evt) {
                console.log('file loader: Load start ', evt)
            }
        else
            ns.reader.onloadstart = settings.onloadstart

        if(settings.onload === undefined)
            ns.reader.onload = function(evt) {
                console.log('file loader: Loading complete ', evt)
            }
        else
            ns.reader.onload = settings.onload
        
        // Read
        for(i in files){
            ns.reader.readAsText(files[i])
        }
    }

    ns.abortRead = function(){
        ns.reader.abort()
    }

    ns.reader = undefined
    
    ns.errorHandler = function(evt){
        var target = evt.target || evt.srcElement
        switch(target.error.code) {
            case target.error.NOT_FOUND_ERR:
                alert('File Not Found!')
                break
            case target.error.NOT_READABLE_ERR:
                alert('File is not readable')
                break
            case target.error.ABORT_ERR:
                break // noop
            default:
                alert('An error occurred reading this file.');
        }
    }

})(jQuery, window.fileLoader = window.fileLoader || {})



/*
// File loader (domino module)
;(function(ns, domino) {
    // Requires domino.js to be initialized:
    if (!domino)
        throw (new Error('domino.js is required to initialize the modules.'));

})((domino.modules = domino.modules || {}), domino)*/