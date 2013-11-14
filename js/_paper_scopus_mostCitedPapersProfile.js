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
                id:'papersLimit'
                ,type: 'number'
                ,value: -1
            },{
                id:'authorsCount'
                ,type: 'number'
                ,value: 10
            },{
                id:'keywordsCount'
                ,type: 'number'
                ,value: 10
            },{
                id:'sourcesCount'
                ,type: 'number'
                ,value: 10
            },{
                id:'dataTable'
                ,dispatch: 'dataTable_updated'
                ,triggers: 'update_dataTable'
            },{
                id:'sankeyNetwork'
                ,dispatch: 'sankeyNetwork_updated'
                ,triggers: 'update_sankeyNetwork'
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
                    if(this.get('sankeyNetwork') !== undefined)
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
                ,network = {}
                ,limit = provider.get('papersLimit')
                ,authorsLimit = provider.get('authorsCount')
                ,keywordsLimit = provider.get('keywordsCount')
                ,sourcesLimit = provider.get('sourcesCount')

            var authorsColId = -1
                ,keywordsColId = -1
                ,sourcesColId = -1
                ,citedByColId = -1
            table[0].forEach(function(txt, i){
                if(txt == 'Authors')
                    authorsColId = i
                if(txt == 'Author Keywords')
                    keywordsColId = i
                if(txt == 'Source title')
                    sourcesColId = i
                if(txt == 'Cited by')
                    citedByColId = i
            })
            if(authorsColId >= 0 && keywordsColId >= 0 && sourcesColId >= 0 && citedByColId >= 0){
                // Sort and filter table
                table = table.slice(0)
                table.shift()
                // table = table.sort(function(a,b){return (+b[citedByColId] || 0) - (+a[citedByColId] || 0)})
                if(limit >0)
                    table = table.filter(function(row,i){return i<limit && (+row[citedByColId] || 0) > 0})

                var usedIndex = {}

                table2net.table = table.slice(0)
                var authors = table2net.getNodes(authorsColId, true, ',')
                    .sort(function(a,b){return b.tableRows.length - a.tableRows.length})
                if(authorsLimit > 0)
                    authors = authors.filter(function(d,i){return i<authorsLimit})
                    authors.forEach(function(d){
                            var key = 'au_'+d.node
                            usedIndex[key] = true
                        })

                table2net.table = table.slice(0)
                var keywords = table2net.getNodes(keywordsColId, true, ';')
                    .sort(function(a,b){return b.tableRows.length - a.tableRows.length})
                if(keywordsLimit > 0)
                    keywords = keywords.filter(function(d,i){return i<keywordsLimit})
                    keywords.forEach(function(d){
                            var key = 'kw_'+d.node
                            usedIndex[key] = true
                        })
                
                table2net.table = table.slice(0)
                var sources = table2net.getNodes(sourcesColId, false, '')
                    .sort(function(a,b){return b.tableRows.length - a.tableRows.length})
                if(sourcesLimit > 0)
                    sources = sources.filter(function(d,i){return i<sourcesLimit})
                    sources.forEach(function(d){
                            var key = 'so_'+d.node
                            usedIndex[key] = true
                        })

                table2net.table = table.slice(0)
                var authorKeywordLinks = table2net.getBipartiteLinks(authorsColId, true, ',', keywordsColId, true, ';')
                    .filter(function(d){return usedIndex['au_'+d.source] && usedIndex['kw_'+d.target]})
                    .sort(function(a,b){return b.tableRows.length - a.tableRows.length})

                table2net.table = table.slice(0)
                var keywordSourcesLinks = table2net.getBipartiteLinks(keywordsColId, true, ';', sourcesColId, false, '')
                    .filter(function(d){return usedIndex['kw_'+d.source] && usedIndex['so_'+d.target]})
                    .sort(function(a,b){return b.tableRows.length - a.tableRows.length})

                // Drop unlinked nodes
                var linkedIndex = {}
                authorKeywordLinks.forEach(function(d){
                    linkedIndex['au_'+d.source] = true
                    linkedIndex['kw_'+d.target] = true
                })
                keywordSourcesLinks.forEach(function(d){
                    linkedIndex['kw_'+d.source] = true
                    linkedIndex['so_'+d.target] = true
                })
                authors = authors.filter(function(d){
                    return linkedIndex['au_'+d.node]
                })
                keywords = keywords.filter(function(d){
                    return linkedIndex['kw_'+d.node]
                })
                sources = sources.filter(function(d){
                    return linkedIndex['so_'+d.node]
                })

                console.log('authors', authors.length, authors)
                console.log('keywords', keywords.length, keywords)
                console.log('sources', sources.length, sources)
                console.log('authorKeywordLinks', authorKeywordLinks.length, authorKeywordLinks)
                console.log('keywordSourcesLinks', keywordSourcesLinks.length, keywordSourcesLinks)

                var index = {}
                    ,indexKey = 0
                network = {
                    'nodes': authors
                                .map(function(d){
                                        var key = 'au_'+d.node
                                        index[key] = indexKey++
                                        return {'name': d.node, 'breadth': 0}
                                    })
                        .concat(
                                keywords
                                    .map(function(d){
                                            var key = 'kw_'+d.node
                                            index[key] = indexKey++
                                            return {'name': d.node, 'breadth': 1}
                                        })
                            )
                        .concat(
                                sources
                                    .map(function(d){
                                            var key = 'so_'+d.node
                                            index[key] = indexKey++
                                            return {'name': d.node, 'breadth': 2}
                                        })
                            )
                    ,'links': authorKeywordLinks
                                .map(function(d){
                                        return {'source': index['au_'+d.source], 'target': index['kw_'+d.target], 'value':d.tableRows.length,'sourceName':d.source, 'targetName':d.target}
                                    })
                        .concat(
                                keywordSourcesLinks
                                    .map(function(d){
                                                return {'source': index['kw_'+d.source], 'target': index['so_'+d.target], 'value':d.tableRows.length,'sourceName':d.source, 'targetName':d.target}
                                        })
                            )
                }

                _self.dispatchEvent('extraction_success', {})
                setTimeout(function(){
                    _self.dispatchEvent('update_sankeyNetwork', {
                        'sankeyNetwork': network
                    })
                }, 200)

            } else {
                _self.dispatchEvent('extraction_fail', {})
            }
        }
    })

    // Draw the diagram
    D.addModule(function(){
        domino.module.call(this)

        this.triggers.events['sankeyNetwork_updated'] = buildAndShow
    })

    

    //// Data processing
    function buildAndShow(provider){
        $('#chart').html('')

        var network = provider.get('sankeyNetwork')
            ,table = provider.get('dataTable')

        // To Adapt
        
        var margin = {top: 1, right: 1, bottom: 6, left: 1},
            width = $('#chart').width() - margin.left - margin.right,
            height = $('#chart').height() - margin.top - margin.bottom;

        var formatNumber = d3.format(",.0f"),
            format = function(d) { return formatNumber(d) + " papers"; },
            color = d3.scale.category20();

        var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var sankey = d3.sankey()
            .nodeWidth(15)
            .nodePadding(10)
            .size([width, height]);

        var path = sankey.link();

      sankey
          .nodes(network.nodes)
          .links(network.links)
          .layout(32);

      var link = svg.append("g").selectAll(".link")
          .data(network.links)
        .enter().append("path")
          .attr("class", "link")
          .attr("d", path)
          .style("stroke-width", function(d) { return Math.max(1, d.dy); })
          .sort(function(a, b) { return b.dy - a.dy; });

      link.append("title")
          .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

      var node = svg.append("g").selectAll(".node")
          .data(network.nodes)
        .enter().append("g")
          .attr("class", "node")
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .call(d3.behavior.drag()
          .origin(function(d) { return d; })
          .on("dragstart", function() { this.parentNode.appendChild(this); })
          .on("drag", dragmove));

      node.append("rect")
          .attr("height", function(d) { return d.dy; })
          .attr("width", sankey.nodeWidth())
          .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
          .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
        .append("title")
          .text(function(d) { return d.name + "\n" + format(d.value); });

      node.append("text")
          .attr("x", -6)
          .attr("y", function(d) { return d.dy / 2; })
          .attr("dy", ".35em")
          .attr("text-anchor", "end")
          .attr("transform", null)
          .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < width / 2; })
          .attr("x", 6 + sankey.nodeWidth())
          .attr("text-anchor", "start");

      function dragmove(d) {
        d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
        sankey.relayout();
        link.attr("d", path);
      }

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


