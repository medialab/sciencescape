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
                id:'normalize'
                ,dispatch: 'normalize_updated'
                ,triggers: 'update_normalize'
                ,type: 'boolean'
                ,value: false
            },{
                id:'dataTable'
                ,dispatch: 'dataTable_updated'
                ,triggers: 'update_dataTable'
            },{
                id:'sourceTitleData'
                ,dispatch: 'sourceTitleData_updated'
                ,triggers: 'update_sourceTitleData'
            },{
                id:'csvData'
                ,dispatch: 'csvData_updated'
                ,triggers: 'update_csvData'
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
                    if(this.get('sourceTitleData') !== undefined){
                        var sourceTitlesByYear = buildAndShow(this)
                        this.dispatchEvent('update_csvData', {
                            csvData: sourceTitlesByYear
                        })
                    }
                }
            }
        ]
    })

    //// Modules

    // Log stuff in the console
    D.addModule(function(){
        domino.module.call(this)

        var _self = this

        this.triggers.events['loadingProgress_updated'] = function(provider, e) {
            // console.log('Loading progress', provider.get('loadingProgress'))
        }

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

    // Draw the timelines
    D.addModule(function(){
        domino.module.call(this)

        var _self = this

        this.triggers.events['sourceTitleData_updated'] = function(provider, e){
            var sourceTitlesByYear = buildAndShow(provider)
            _self.dispatchEvent('update_csvData', {
                csvData: sourceTitlesByYear
            })
        }
    })

    // Normalize checkbox
    D.addModule(function(){
        domino.module.call(this)

        var _self = this

        $('#normalize').click(function(){
            _self.dispatchEvent('update_normalize', {
                normalize: $('#normalize').is(':checked')
            })
        })
    })
    
    // Download button     
    D.addModule(function(){
        domino.module.call(this)

        var _self = this
            ,container = $('#download')

        $(document).ready(function(e){
            container.html('<div style="height: 25px"><button class="btn btn-block disabled"><i class="icon-download"></i> Download CSV</button></div>')
        })
        
        this.triggers.events['csvData_updated'] = function(provider, e){
            var button = container.find('button')

            button.removeClass('disabled').click(function(){
                if(!button.hasClass('disabled')){
                    button.addClass('disabled')
                    
                    var data = provider.get('csvData')
                        ,csv = []

                    var years = []
                    // Get the list of items
                    for(item in data){
                        for(year in data[item]){
                            years.push(year)
                        }
                    }
                    years = extractCases(years)

                    var csvElement = function(txt){
                        txt = ''+txt //cast
                        return '"'+txt.replace(/"/gi, '""')+'"'
                    }

                    var content = []
                    // headline
                    content.push(['"items"'].concat(years.map(csvElement).join(',')))
                    
                    // content
                    for(item in data){
                        row = [item]
                        years.forEach(function(year){
                            row.push(data[item][year] || 0)
                        })
                        content.push('\n'+row.map(csvElement).join(','))
                    }

                    // Download
                    var blob = new Blob(content, {'type':'text/csv;charset=utf-8'})
                        ,filename = "Table.csv"
                    if(navigator.userAgent.match(/firefox/i))
                       alert('Note:\nFirefox does not handle file names, so you will have to rename this file to\n\"'+filename+'\""\nor some equivalent.')
                    saveAs(blob, filename)
                }
            })
        }
    })
    

    //// Data processing
    function buildAndShow(provider){
        $('#timelines').html('')

        var soData = provider.get('sourceTitleData')
            ,table = provider.get('dataTable')
            ,yearColId = -1
            ,normalize = provider.get('normalize')
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

        var totalPerYear = {}
        if(normalize){
            for(var y=yearMin; y<=yearMax; y++){
                totalPerYear[y] = 0
            }
            for(var ii=1; ii<table.length; ii++){
                var y = table[ii][yearColId]
                if(totalPerYear[y] !== undefined)
                    totalPerYear[y]++
                else
                    console.log('undefined year',y)
            }
        }

        var sourceTitlesByYear = {}

        soData.forEach(function(so, i){
            if(so.tableRows.length>=10){
                // Data
                var data = {}
                for(var y=yearMin; y<=yearMax; y++){
                    data[y] = 0
                }
                so.tableRows.forEach(function(tableRow){
                    var year = +table[tableRow][yearColId]
                    if(isNaN(year)){
                        console.log('Year is not a number for '+so.node+' on row '+tableRow, [table[0], table[tableRow]])
                    } else if (year < yearMin || year > yearMax) {
                        console.log('Year is out of range ('+year+') for '+so.node+' on row '+tableRow, [table[0], table[tableRow]])
                    } else {
                        if(data[year] === undefined){
                            data[year] = 1
                            console.log('unknown year', so)
                        } else {
                            data[year]++
                        }
                    }
                })

                sourceTitlesByYear[so.node] = data

                var flatData = []
                if(normalize){
                    for(year in data){
                        if(Date.UTC(year, 0))
                            flatData.push([Date.UTC(year, 0), Math.round(1000 * (data[year]/totalPerYear[year] || 0)) / 1000])
                    }
                } else {
                    for(year in data){
                        if(Date.UTC(year, 0))
                            flatData.push([Date.UTC(year, 0), data[year]])
                    }
                }
                //console.log('flatData for '+so.node, flatData)

                // Prepare DOM
                var row = $('<div class="row"/>')
                    ,timeline = $('<div class="span8"/>').append(
                        $('<div/>').attr('id', '_'+$.md5(so.node))
                    )
                row.append(timeline)
                row.append($('<div class="span4"/>').append(
                        $('<strong/>').text(so.node)
                    ).append(
                        $('<span class="text-info"/>').text(' ('+so.tableRows.length+')')
                    )
                )
                $('#timelines').append(row)
                
                // Mouseover
                var width = timeline.width()
                timeline.mousemove(function(e){
                    var x = e.offsetX
                        ,ergonomyOffset = width / (2 * (yearMax - yearMin))     // So that you see the tooltip of a year around its peak
                        ,year = yearMin + Math.floor((yearMax - yearMin)*(x+ergonomyOffset)/width)
                        ,count = data[year]
                    timeline.attr('title', year + ": " + count + ((normalize)?('/'+totalPerYear[year]):(''))
                        + ' paper' + ((count>1)?('s'):('')) + ((normalize)?(' (' + (Math.round(1000 * data[year]/totalPerYear[year])/1000) +')'):('') ))
                })

                // D3
                var height = 32
                    ,x = d3.scale.linear().domain([yearMin, yearMax]).range([0, width])
                
                var chart = d3.horizon()
                    .width(width)
                    .height(height)
                    .bands(3)
                    .mode("offset")
                    .interpolate("monotone")

                // var svg = d3.select('#timelines').append("svg")
                var svg = d3.select('#_'+$.md5(so.node)).append("svg")
                    .attr("width", width)
                    .attr("height", height)

                // Render the chart.
                svg.data([flatData]).call(chart)

                svg.append("g")
                    .attr("class", "x grid")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.svg.axis().scale(x).tickSubdivide(1).tickSize(-height));
            }
        })
        return sourceTitlesByYear
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

    var extractCases = function(data_array, elementAccessor){
        if(elementAccessor === undefined)
            elementAccessor = function(x){return x}
        
        var temp_result = data_array.map(function(d){
            return {id:elementAccessor(d), content:d}
        }).sort(function(a, b) {
            return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
        });
        
        // Merge Doubles
        var result = []
        for (var i = 0; i < temp_result.length; i++) {
            if (i==0 || temp_result[i - 1].id != temp_result[i].id) {
                result.push(temp_result[i].content)
            }
        }
        
        return result
    }

})(jQuery, domino)


