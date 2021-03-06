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
                id:'papersVolume'
                ,dispatch: 'papersVolume_updated'
                ,triggers: 'update_papersVolume'
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
            },{
                // Redraw when 'normalize' is enabled or disabled
                triggers:['normalize_updated']
                ,method: function(){
                    if(this.get('papersVolume') !== undefined)
                        buildAndShow(this)
                }
            }
        ]
    })

    //// Modules

    // Log stuff in the console
    D.addModule(function(){
        domino.module.call(this)

        this.triggers.events['networkJson_updated'] = function(provider, e) {
            console.log('Network: ', provider.get('networkJson'))
        }
    })

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

        this.triggers.events[o['taskname']+'_init'] = function(provider, e){
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

        this.triggers.events['parsing_pending'] = function(provider, e){
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

        this.triggers.events['extraction_pending'] = function(provider, e){
            var table = provider.get('dataTable')
                ,yearColId = -1
            table[0].forEach(function(txt, i){
                if(txt == 'Year')
                    yearColId = i
            })
            if(yearColId>=0){
                table2net.table = table.slice(0)
                table2net.table.shift()
                var years = table2net.getNodes(yearColId, true, ';')
                if(years){
                    setTimeout(function(){
                        _self.dispatchEvent('update_papersVolume', {
                            'papersVolume': years
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

    // Draw the timelines
    D.addModule(function(){
        domino.module.call(this)

        this.triggers.events['papersVolume_updated'] = buildAndShow
    })

    

    //// Data processing
    function buildAndShow(provider){
        $('#timeline').html('')

        var years = provider.get('papersVolume')
            ,table = provider.get('dataTable')
            ,yearColId = -1
        table[0].forEach(function(txt, i){
            if(txt == 'PY (Year Published)' || txt == 'PY')
                yearColId = i
        })
        years.sort(function(a,b){return parseInt(a.node)-parseInt(b.node)})
        var yearMin = 10000
            ,yearMax = 0
        years.forEach(function(yItem){
            var year = parseInt(yItem.node)
            if(year && year>0 && year < 10000){
                yearMin = Math.min(yearMin, year)
                yearMax= Math.max(yearMax, year)
            }
        })

        // Initialize data (we do that in case of missing years in the source)
        var data = {}
        for(var y=yearMin; y<=yearMax; y++){
            data[y] = 0
        }

        // Populate data
        years.forEach(function(yItem){
            var year = parseInt(yItem.node)
            if(Date.UTC(year, 0))
                data[year] = yItem.tableRows.length
        })

        var flatData = []
        for(var year in data ){
            if(Date.UTC(year, 0)){
                flatData.push([year, data[year]])
                // flatData.push([Date.UTC(year, 0), data[year]])
            }
        }

        // Prepare DOM
        var row = $('<div class="row"/>')
            ,timeline = $('<div class="span12"/>').append(
                $('<div/>').attr('id', 'volume')
            ).append(
                $('<strong class="pull-right"/>').text('Volume of published papers each year')
            )
        row.append(timeline)
        $('#timeline').append(row)

        // Mouseover
        var width = timeline.width()
        timeline.mousemove(function(e){
            var x = e.offsetX
                ,ergonomyOffset = width / (2 * (yearMax - yearMin))     // So that you see the tooltip of a year around its peak
                ,year = yearMin + Math.floor((yearMax - yearMin)*(x+ergonomyOffset)/width)
                ,count = data[year]
            timeline.attr('title', year + ": " + count
                + ' paper' + ((count>1)?('s'):('')))
        })

        // D3
        var height = 300
            ,parse = d3.time.format("%Y").parse
            ,x = d3.time.scale().domain([parse(''+yearMin), parse(''+yearMax)]).range([0, width])
            ,margin_bottom = 12
        
        var chart = d3.horizon()
            .width(width)
            .height(height)
            .x(function(d) { return parse(d[0]) })
            .y(function(d) { return d[1] })
            .bands(1)
            .mode("offset")
            .interpolate("monotone")

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickSubdivide(1)
            .tickSize(-height)

        var svg = d3.select('#volume').append("svg")
            .attr("width", width)
            .attr("height", height+margin_bottom)

        // Render the chart.
        svg.data([flatData]).call(chart)

        svg.append("g")
            .attr("class", "x grid")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)

    }
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


