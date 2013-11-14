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

            console.log('table', table)
            // TODO:
            // Get the 100 most cited papers
            // Parse the authors
            // Separate main authors from "others"
            // Parse the keywords
            // Separate main keywords from "others"
            // Parse the main journals
            // Separate main journals from "others"
            // Build the network

            network = {"nodes":[
                    {"name":"Agricultural 'waste'"},
                    {"name":"Bio-conversion"},
                    {"name":"Liquid"},
                    {"name":"Losses"},
                    {"name":"Solid"},
                    {"name":"Gas"},
                    {"name":"Biofuel imports"},
                    {"name":"Biomass imports"},
                    {"name":"Coal imports"},
                    {"name":"Coal"},
                    {"name":"Coal reserves"},
                    {"name":"District heating"},
                    {"name":"Industry"},
                    {"name":"Heating and cooling - commercial"},
                    {"name":"Heating and cooling - homes"},
                    {"name":"Electricity grid"},
                    {"name":"Over generation / exports"},
                    {"name":"H2 conversion"},
                    {"name":"Road transport"},
                    {"name":"Agriculture"},
                    {"name":"Rail transport"},
                    {"name":"Lighting & appliances - commercial"},
                    {"name":"Lighting & appliances - homes"},
                    {"name":"Gas imports"},
                    {"name":"Ngas"},
                    {"name":"Gas reserves"},
                    {"name":"Thermal generation"},
                    {"name":"Geothermal"},
                    {"name":"H2"},
                    {"name":"Hydro"},
                    {"name":"International shipping"},
                    {"name":"Domestic aviation"},
                    {"name":"International aviation"},
                    {"name":"National navigation"},
                    {"name":"Marine algae"},
                    {"name":"Nuclear"},
                    {"name":"Oil imports"},
                    {"name":"Oil"},
                    {"name":"Oil reserves"},
                    {"name":"Other waste"},
                    {"name":"Pumped heat"},
                    {"name":"Solar PV"},
                    {"name":"Solar Thermal"},
                    {"name":"Solar"},
                    {"name":"Tidal"},
                    {"name":"UK land based bioenergy"},
                    {"name":"Wave"},
                    {"name":"Wind"}
                    ],
                    "links":[
                    {"source":0,"target":1,"value":124.729},
                    {"source":1,"target":2,"value":0.597},
                    {"source":1,"target":3,"value":26.862},
                    {"source":1,"target":4,"value":280.322},
                    {"source":1,"target":5,"value":81.144},
                    {"source":6,"target":2,"value":35},
                    {"source":7,"target":4,"value":35},
                    {"source":8,"target":9,"value":11.606},
                    {"source":10,"target":9,"value":63.965},
                    {"source":9,"target":4,"value":75.571},
                    {"source":11,"target":12,"value":10.639},
                    {"source":11,"target":13,"value":22.505},
                    {"source":11,"target":14,"value":46.184},
                    {"source":15,"target":16,"value":104.453},
                    {"source":15,"target":14,"value":113.726},
                    {"source":15,"target":17,"value":27.14},
                    {"source":15,"target":12,"value":342.165},
                    {"source":15,"target":18,"value":37.797},
                    {"source":15,"target":19,"value":4.412},
                    {"source":15,"target":13,"value":40.858},
                    {"source":15,"target":3,"value":56.691},
                    {"source":15,"target":20,"value":7.863},
                    {"source":15,"target":21,"value":90.008},
                    {"source":15,"target":22,"value":93.494},
                    {"source":23,"target":24,"value":40.719},
                    {"source":25,"target":24,"value":82.233},
                    {"source":5,"target":13,"value":0.129},
                    {"source":5,"target":3,"value":1.401},
                    {"source":5,"target":26,"value":151.891},
                    {"source":5,"target":19,"value":2.096},
                    {"source":5,"target":12,"value":48.58},
                    {"source":27,"target":15,"value":7.013},
                    {"source":17,"target":28,"value":20.897},
                    {"source":17,"target":3,"value":6.242},
                    {"source":28,"target":18,"value":20.897},
                    {"source":29,"target":15,"value":6.995},
                    {"source":2,"target":12,"value":121.066},
                    {"source":2,"target":30,"value":128.69},
                    {"source":2,"target":18,"value":135.835},
                    {"source":2,"target":31,"value":14.458},
                    {"source":2,"target":32,"value":206.267},
                    {"source":2,"target":19,"value":3.64},
                    {"source":2,"target":33,"value":33.218},
                    {"source":2,"target":20,"value":4.413},
                    {"source":34,"target":1,"value":4.375},
                    {"source":24,"target":5,"value":122.952},
                    {"source":35,"target":26,"value":839.978},
                    {"source":36,"target":37,"value":504.287},
                    {"source":38,"target":37,"value":107.703},
                    {"source":37,"target":2,"value":611.99},
                    {"source":39,"target":4,"value":56.587},
                    {"source":39,"target":1,"value":77.81},
                    {"source":40,"target":14,"value":193.026},
                    {"source":40,"target":13,"value":70.672},
                    {"source":41,"target":15,"value":59.901},
                    {"source":42,"target":14,"value":19.263},
                    {"source":43,"target":42,"value":19.263},
                    {"source":43,"target":41,"value":59.901},
                    {"source":4,"target":19,"value":0.882},
                    {"source":4,"target":26,"value":400.12},
                    {"source":4,"target":12,"value":46.477},
                    {"source":26,"target":15,"value":525.531},
                    {"source":26,"target":3,"value":787.129},
                    {"source":26,"target":11,"value":79.329},
                    {"source":44,"target":15,"value":9.452},
                    {"source":45,"target":1,"value":182.01},
                    {"source":46,"target":15,"value":19.013},
                    {"source":47,"target":15,"value":289.366}
                ]}

            _self.dispatchEvent('extraction_success', {})
            setTimeout(function(){
                _self.dispatchEvent('update_sankeyNetwork', {
                    'sankeyNetwork': network
                })
            }, 200)


            //     ,yearColId = -1
            // table[0].forEach(function(txt, i){
            //     if(txt == 'Year')
            //         yearColId = i
            // })
            // if(yearColId>=0){
            //     table2net.table = table.slice(0)
            //     table2net.table.shift()
            //     var years = table2net.getNodes(yearColId, true, ';')
            //     if(years){
            //         setTimeout(function(){
            //             _self.dispatchEvent('update_sankeyNetwork', {
            //                 'sankeyNetwork': years
            //             })
            //         }, 200)

            //         _self.dispatchEvent('extraction_success', {})
            //     } else {
            //         _self.dispatchEvent('extraction_fail', {})
            //     }
            // } else {
            //     _self.dispatchEvent('extraction_fail', {})
            // }
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
            format = function(d) { return formatNumber(d) + " TWh"; },
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


