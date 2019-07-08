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
            },{
                id:'sourceTitleData'
                ,dispatch: 'sourceTitleData_updated'
                ,triggers: 'update_sourceTitleData'
            }
        ],services: [
        ],hacks:[
            {
                // Need to be declared
                triggers:[
                    'loading_started'
                    ,'loading_completed'
                    ,'parsing_init'
                    ,'parsing_pending'
                    ,'parsing_success'
                    ,'parsing_fail'
                    ,'extraction_success'
                    ,'extraction_pending'
                    ,'extraction_fail'
                ]
            },{
                // Init parsing progress bar when the file is loaded
                // (NB: init the progress bar will trigger pending, and pending will trigger the parsing)
                triggers:['loading_completed']
                ,method: function(){
                    this.dispatchEvent('parsing_init')
                }
            },{
                // Init extraction progress bar when the table is parsed
                triggers:['dataTable_updated']
                ,method: function(){
                    this.dispatchEvent('extraction_init')
                }
            }
        ]
    })

    //// Modules

    // File loader
    D.addModule(function(){
        domino.module.call(this)

        var _self = this
            ,container = $('#extract')

        $(document).ready(function(e){
            container.html('<div style="height: 50px"><div class="input"><input type="file" name="file"/><span class="help-block">Note: you can drag and drop a file</span></div><div class="progress" style="display: none;"><div class="bar" style="width: 0%;"></div></div></div>')
            container.find('input').on('change', function(evt){
                var target = evt.target || evt.srcElement
                _self.dispatchEvent('update_inputFile', {
                    inputFile: target.files
                })
            })
        })

        
        this.triggers.events['inputFile_updated'] = function(provider, e){
            var files = provider.get('inputFile')
            if( files !== undefined && files.length >0 ){
                container.find('div.input').hide()
                container.find('div.progress').show()
                var bar = container.find('div.progress .bar')
                bar.css('width', '0%')
                
                var fileLoader = new FileLoader()
                _self.dispatchEvent('update_inputFileUploader', {
                    inputFileUploader: fileLoader
                })
                fileLoader.read(files, {
                    onloadstart: function(evt){
                        _self.dispatchEvent('loading_started')
                    },
                    onload: function(evt){
                        _self.dispatchEvent('loading_completed')
                    },
                    onprogress: function(evt){
                        // evt is an ProgressEvent
                        if (evt.lengthComputable) {
                            _self.dispatchEvent('update_loadingProgress', {
                                loadingProgress: Math.round((evt.loaded / evt.total) * 100)
                            })
                        }
                    }
                })
            }
        }

        this.triggers.events['loadingProgress_updated'] = function(provider, e){
            var percentLoaded = +provider.get('loadingProgress')
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
    
    // Generic module for progress bar
    var ProgressBar = function(options, d) {
        domino.module.call(this)

        var _self = this
            ,o = options || {}
            ,el = o['element'] || $('<div/>')

        el.html('<div style="height: 25px;"><div class="progress" style="display: none"><div class="bar" style="width: 0%;"></div></div></div>')

        this.triggers.events[o['taskname']+'_init'] = function(){
            el.find('div.progress').show()
            el.find('div.progress').addClass('progress-striped')
            el.find('div.progress').addClass('active')
            el.find('div.progress div.bar').css('width', '100%')
            el.find('div.progress div.bar').text(o['taskname']+'...')
            _self.dispatchEvent(o['taskname']+'_pending', {})
        }

        this.triggers.events[o['taskname']+'_pending'] = function(){
            el.find('div.progress').removeClass('progress-striped')
            el.find('div.progress').removeClass('active')
        }

        this.triggers.events[o['taskname']+'_success'] = function(){
            el.find('div.progress div.bar').addClass('bar-success')
            el.find('div.progress div.bar').text(o['taskname']+' successful')
        }

        this.triggers.events[o['taskname']+'_fail'] = function(){
            el.find('div.progress div.bar').addClass('bar-danger')
            el.find('div.progress div.bar').text(o['taskname']+' failed')
        }

        this.html = el
    }
    
    // Parsing progress bar
    D.addModule(ProgressBar, [{
        element: $('#parsing')
        ,taskname: 'parsing'
    }])

    // Extraction progress bar
    D.addModule(ProgressBar, [{
        element: $('#extraction')
        ,taskname: 'extraction'
    }])
    
    // Processing: parsing
    D.addModule(function(){
        domino.module.call(this)

        var _self = this

        this.triggers.events['parsing_pending'] = function(provider){
            var fileLoader = provider.get('inputFileUploader')
                ,data = parse_CSV_rows(fileLoader.reader.result)
            if(data){
                setTimeout(function(){
                    _self.dispatchEvent('update_dataTable', {
                        'dataTable': data
                    })
                }, 200)

                _self.dispatchEvent('parsing_success', {})
            } else {
                _self.dispatchEvent('parsing_fail', {})
            }
        }
    })

    // Processing: extraction
    D.addModule(function(){
        domino.module.call(this)

        var _self = this

        this.triggers.events['extraction_pending'] = function(provider){
            var table = provider.get('dataTable')
                ,soColId = -1
            table[0].forEach(function(txt, i){
                if(txt == 'Source title')
                    soColId = i
            })
            console.log('soColId', soColId)
            if(soColId>=0){
                table2net.table = table.slice(0)
                table2net.table.shift()
                var sourceTitles = table2net.getNodes(soColId, true, ';')
                if(sourceTitles){
                    setTimeout(function(){
                        _self.dispatchEvent('update_sourceTitleData', {
                            'sourceTitleData': sourceTitles
                        })
                    }, 200)

                    _self.dispatchEvent('extraction_success', {})
                } else {
                    _self.dispatchEvent('extraction_fail', {})
                }
            } else {
                _self.dispatchEvent('extraction_fail', {})
            }
        }
    })

    // Display the result
    D.addModule(function(){
        domino.module.call(this)

        var _self = this

        this.triggers.events['sourceTitleData_updated'] = function(provider, e){
            var soData = provider.get('sourceTitleData')
                ,table = provider.get('dataTable')
                ,yearColId = -1
            table[0].forEach(function(txt, i){
                if(txt == 'Year')
                    yearColId = i
            })
            soData.sort(function(a,b){return b.tableRows.length-a.tableRows.length})
            var yearMin = 10000
                ,yearMax = 0
            table.forEach(function(tableRow){
                var year = tableRow[yearColId]
                if(year && year>0 && year < 10000){
                    yearMin = Math.min(yearMin, year)
                    yearMax= Math.max(yearMax, year)
                }
            })
            soData.forEach(function(so, i){
                so.yearly = {}
                for(var y=yearMin; y<=yearMax; y++){
                    so.yearly[y] = 0
                }
                so.tableRows.forEach(function(tableRow){
                    var year = +table[tableRow][yearColId]
                    if(isNaN(year)){
                        console.log('Year is not a number for '+so.node+' on row '+tableRow, [table[0], table[tableRow]])
                    } else if (year < yearMin || year > yearMax) {
                        console.log('Year is out of range ('+year+') for '+so.node+' on row '+tableRow, [table[0], table[tableRow]])
                    } else {
                        if(so.yearly[year] === undefined){
                            so.yearly[year] = 1
                            console.log('unknown year', so)
                        } else {
                            so.yearly[year]++
                        }
                    }
                })
            })

            var data = []
            for(var y=yearMin; y<=yearMax; y++){
                data.push({
                    year:y
                    ,sourceTitles:soData.map(function(so){
                        return {sourceTitle:so.node, count:so.yearly[y]}
                    }).sort(function(a,b){return b.count-a.count})
                })
            }

            var currentRow
            data.forEach(function(yearData, i){
                if(i%3 == 0){
                    currentRow = $('<div class="row"/>')
                    $('#content').append(currentRow)
                }
                currentRow.append(
                    $('<div class="span4"/>').append(
                        $('<h3/>').text(yearData.year)
                    ).append(
                        $('<ul/>').append(
                            yearData.sourceTitles.filter(function(d,j){
                                return j<10
                            }).filter(function(so){
                                return so.count > 0
                            }).map(function(so){
                                return $('<li/>')
                                    .append(
                                        $('<strong/>')
                                            .text(so.sourceTitle)
                                            .addClass('so')
                                            .addClass('so_'+$.md5(so.sourceTitle))
                                            .mouseenter(function(){
                                                $('.so.so_'+$.md5(so.sourceTitle)).addClass('highlight')
                                            }).mouseleave(function(){
                                                $('.so.so_'+$.md5(so.sourceTitle)).removeClass('highlight')
                                            })
                                    ).append($('<span class="text-info"/>').text(' '+so.count+' paper'+( (so.count>1)?('s'):('') )))
                            })
                        )
                    )
                )
            })
        }
    })

    //// Data processing
    function parse_CSV_rows(csv){
        var rowsParser = d3.csv.parseRows
        return rowsParser(csv)
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


