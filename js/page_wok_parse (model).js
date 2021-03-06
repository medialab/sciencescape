domino.settings({
    shortcutPrefix: "::" // Hack: preventing a bug related to a port in a URL for Ajax
    ,verbose: false
})

;(function($, domino, undefined){
    var D = new domino({
        name: "main"
        ,properties: [
            {
                id: 'inputFile'
                ,dispatch: 'inputFile_updated'
                ,triggers: 'update_inputFile'
            },{
                id:'inputFileUploader'
                ,dispatch: 'inputFileUploader_updated'
                ,triggers: 'update_inputFileUploader'
            },{
                id:'loadingProgress'
                ,dispatch: 'loadingProgress_updated'
                ,triggers: 'update_loadingProgress'
                ,value: 0
            },{
                id:'dataTable'
                ,dispatch: 'dataTable_updated'
                ,triggers: 'update_dataTable'
            }
        ],services: [
        ],hacks:[
        ]
    })

    //// Modules

    // Log stuff in the console
    D.addModule(function(){
        domino.module.call(this)

        this.triggers.events['loadingProgress_updated'] = function(d) {
            // console.log('Loading progress', D.get('loadingProgress'))
        }

        this.triggers.events['networkJson_updated'] = function(d) {
            console.log('Network: ',D.get('networkJson'))
        }
    })

    // File loader
    D.addModule(function(){
        domino.module.call(this)

        var container = $('#wokextract')

        $(document).ready(function(e){
            container.html('<div style="height: 50px"><div class="input"><input type="file" name="file"/><span class="help-block">Note: you can drag and drop a file</span></div><div class="progress" style="display: none;"><div class="bar" style="width: 0%;"></div></div></div>')
            container.find('input').on('change', function(evt){
                var target = evt.target || evt.srcElement
                D.dispatchEvent('update_inputFile', {
                    inputFile: target.files
                })
            })
        })

        
        this.triggers.events['inputFile_updated'] = function(){
            var files = D.get('inputFile')
            if( files !== undefined && files.length >0 ){
                container.find('div.input').hide()
                container.find('div.progress').show()
                var bar = container.find('div.progress .bar')
                bar.css('width', '0%')
                
                var fileLoader = new FileLoader()
                D.dispatchEvent('update_inputFileUploader', {
                    inputFileUploader: fileLoader
                })
                fileLoader.read(files, {
                    onloadstart: function(evt){
                        D.dispatchEvent('loading_started')
                    },
                    onload: function(evt){
                        D.dispatchEvent('loading_completed')
                    },
                    onprogress: function(evt){
                        // evt is an ProgressEvent
                        if (evt.lengthComputable) {
                            D.dispatchEvent('update_loadingProgress', {
                                loadingProgress: Math.round((evt.loaded / evt.total) * 100)
                            })
                        }
                    }
                })
            }
        }

        this.triggers.events['loadingProgress_updated'] = function(){
            var percentLoaded = +D.get('loadingProgress')
            // Increase the progress bar length.
            if (percentLoaded < 100) {
                var bar = container.find('div.progress .bar')
                bar.css('width', percentLoaded + '%')
                bar.text(percentLoaded + '%')
            }
        }

        this.triggers.events['loading_started'] = function(){
            var bar = container.find('div.progress .bar')
            bar.removeClass("bar-success")
            bar.removeClass("bar-warning")
        }

        this.triggers.events['loading_completed'] = function(){
            // Ensure that the progress bar displays 100% at the end.
            var bar = container.find('div.progress .bar')
            bar.addClass('bar-success')
            bar.css('width', '100%')
            bar.text('Reading: 100%')
        }
    })
    
    // Parsing progress bar
    D.addModule(function(){
        domino.module.call(this)

        var container = $('#parsing')

        $(document).ready(function(e){
            container.html('<div style="height: 25px;"><div class="progress" style="display: none"><div class="bar" style="width: 0%;"></div></div></div>')
        })
        
        this.triggers.events['loading_completed'] = function(){
            container.find('div.progress').show()
            container.find('div.progress').addClass('progress-striped')
            container.find('div.progress').addClass('active')
            container.find('div.progress div.bar').css('width', '100%')
            container.find('div.progress div.bar').text('Parsing...')
            D.dispatchEvent('task_pending', {})
        }

        this.triggers.events['task_pending'] = function(){
            container.find('div.progress').removeClass('progress-striped')
            container.find('div.progress').removeClass('active')
        }

        this.triggers.events['task_success'] = function(){
            container.find('div.progress div.bar').addClass('bar-success')
            container.find('div.progress div.bar').text('Parsing successful')
        }

        this.triggers.events['task_fail'] = function(){
            container.find('div.progress div.bar').addClass('bar-danger')
            container.find('div.progress div.bar').text('Parsing failed')
        }
    })
    
    // Processing: parsing
    D.addModule(function(){
        domino.module.call(this)

        this.triggers.events['task_pending'] = function(){
            var fileLoader = D.get('inputFileUploader')
                ,wok_data = build_wosDoiLinks(fileLoader.reader.result)
            if(wok_data){
                setTimeout(function(){
                    D.dispatchEvent('update_dataTable', {
                        'dataTable': wok_data
                    })
                }, 200)

                D.dispatchEvent('task_success', {})
            } else {
                D.dispatchEvent('task_fail', {})
            }
        }
    })

    //// Data processing
    function build_wosDoiLinks(wos){
        if ( wos.substring(0,2) != "FN" ){
            return build_DoiLinks(wos, d3.csv.parseRows, 'CR', 'DOI_CITED')
        } else {
            return convert_wos_to_CSV(wos, true)
        }
    }

    function build_DoiLinks(csv, rowsParser, column, doi_column_name){
        var lines = rowsParser(csv)
        var headline = lines.shift()
        var CR_index = -1;  // Index containing the references
        headline.forEach(function(h,i){
            if(h == column){
                CR_index = i
            }
        })
        var csvRows = [headline]
        lines.forEach(function(row){
            if(CR_index>=0 && CR_index < row.length){
                // Extract DOI reference of the cited paper if applicable
                var doi_refs = d3.merge(row[CR_index]
                    .split(";")
                    .map(function(ref){
                        return ref.split(",").filter(function(d){
                            return d.match(/ +DOI[ :]+.*/gi)
                        })
                    })).map(function(doi){
                        //return doi.trim().split(/[ :]/)[1] || ""
                        var r = / +DOI[ :]+(.*)/gi
                        return r.exec(doi)[1] || ''
                    }).filter(function(doi){
                        return doi.trim() != ""
                    })
                row.unshift(doi_refs.join("; "))
            } else {
                row.unshift("")
            }
            csvRows.push(row)
        })
        
        headline.unshift(doi_column_name)
        return csvRows
    }

    function convert_wos_to_CSV(wos, extractDOI){
        var data = [];
        var currentFieldTag = "";
        var currentItem = {};
        var lines = wos.split("\n");
        if(lines.shift().substring(0,2) == "FN"){
            lines.forEach(function(line){
                var candidateFieldTag = line.substring(0,2);
                if(candidateFieldTag != "  "){
                    currentFieldTag = candidateFieldTag;
                }
                
                if(currentFieldTag == "ER"){
                    data.push(currentItem);
                    currentItem = new Object();
                } else {
                    if(currentItem[currentFieldTag]){
                        if(currentFieldTag=="AU"
                            || currentFieldTag=="AF"
                            || currentFieldTag=="C1"
                            || currentFieldTag=="CR"
                        ){
                            currentItem[currentFieldTag] += "|" + line.substring(3);
                        } else {
                            currentItem[currentFieldTag] += " " + line.substring(3);
                        }
                        
                        // Extract citations
                        if(currentFieldTag=="CR" && extractDOI){
                            // Extract DOI reference of the cited paper if applicable
                            var doi_refs = line.substring(3).match(/DOI.*/gi);
                            if(doi_refs && doi_refs.length>0){
                                if(currentItem["DOI_CITED"]){
                                    currentItem["DOI_CITED"] += "|" + doi_refs[0].split(" ")[1];
                                } else {
                                    currentItem["DOI_CITED"] = doi_refs[0].split(" ")[1];
                                }
                            }
                        }
                    } else {
                        currentItem[currentFieldTag] = line.substring(3);
                    }
                }
            });
        } else {
            alert("There is a problem with the WOS file\n(No FileName fieldtag)");
        }

        // At this point, data is a list of objects.
        // Convert it to CSV

        var headers = []
        data.forEach(function(item){
            for(i in item){
                if(!headers.some(function(x){return x==i;})){
                    headers.push(i)
                }
            }
        });

        var csvRows = []
        csvRows.push(headers)

        data.forEach(function(item){
            csvRows.push(headers.map(function(header){
                return item[header] || '';
            }))
        })
        return csvRows
    }

    // Utilities
    function clean_expression(expression){
        expression = expression || "";
        return expression.replace(/ +/gi, ' ').trim().toLowerCase();
    }
    function dehydrate_expression(expression){
        expression = expression || "";
        return expression.replace(/[^a-zA-Z0-9]*/gi, '').trim().toLowerCase();
    }
    function xmlEntities(expression) {
        expression = expression || "";
        return String(expression).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function log(t){$("#log").text($("#log").text()+t);};

})(jQuery, domino)


