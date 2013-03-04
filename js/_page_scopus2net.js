domino.settings({
    shortcutPrefix: "::" // Hack: preventing a bug related to a port in a URL for Ajax
    ,verbose: true
})

;(function($, domino, undefined){
    var D = new domino({
        name: "main"
        ,properties: [

            {
                id:'inputCSVfiles'
                ,dispatch: 'inputCSVfiles_updated'
                ,triggers: 'update_inputCSVfiles'
            },{
                id:'dataTable'
                ,dispatch: 'dataTable_updated'
                ,triggers: 'update_dataTable'
            },{
                id:'networkJson'
                ,dispatch: 'networkJson_updated'
                ,triggers: 'update_networkJson'
            },{
                id:'networkOptions'
                ,dispatch: 'networkOptions_updated'
                ,triggers: 'update_networkOptions'
            },{
                id:'loadingProgress'
                ,dispatch: 'loadingProgress_updated'
                ,triggers: 'update_loadingProgress'
                ,value: 0
            },{
                id:'sigmaInstance'
                ,dispatch: 'sigmaInstance_updated'
                ,triggers: 'update_sigmaInstance'
            },{
                id:'minDegreeThreshold'
                // ,type: 'integer'
                ,value: 2
                ,dispatch: 'minDegreeThreshold_updated'
                ,triggers: 'update_minDegreeThreshold'
            },{
                id:'removeMostConnected'
                ,type: 'boolean'
                ,value: true
                ,dispatch: 'removeMostConnected_updated'
                ,triggers: 'update_removeMostConnected'
            },{
                id: 'mostConnectedNodesRemoved'
                ,dispatch: 'mostConnectedNodesRemoved_updated'
                ,triggers: 'update_mostConnectedNodesRemoved'
            },{
                id: 'poorlyConnectedNodesRemoved'
                ,dispatch: 'poorlyConnectedNodesRemoved_updated'
                ,triggers: 'update_poorlyConnectedNodesRemoved'
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

        var container = $('#scopusextract')

        $(document).ready(function(e){
            container.html('<div style="height: 50px"><div class="input"><input type="file" name="file"/><span class="help-block">Note: you can drag and drop a file</span></div><div class="progress" style="display: none;"><div class="bar" style="width: 0%;"></div></div></div>')
            container.find('input').on('change', function(evt){
                var target = evt.target || evt.srcElement
                D.dispatchEvent('update_inputCSVfiles', {
                    inputCSVfiles: target.files
                })
            })
        })

        
        this.triggers.events['inputCSVfiles_updated'] = function(){
            var files = D.get('inputCSVfiles')
            if( files !== undefined && files.length >0 ){
                container.find('div.input').hide()
                container.find('div.progress').show()
                var bar = container.find('div.progress .bar')
                bar.css('width', '0%')
                
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
            container.html('<div style="height: 25px;"><div class="progress progress-striped active"><div class="bar" style="width: 0%;"></div></div></div>')
        })
        
        this.triggers.events['loading_completed'] = function(){
            container.find('div.progress').show()
            container.find('div.progress div.bar').css('width', '100%')
            container.find('div.progress div.bar').text('Parsing...')
            D.dispatchEvent('task_pending', {})
        }

        this.triggers.events['task_pending'] = function(){
            var scopusnet_data = build_scopusDoiLinks(fileLoader.reader.result)
            container.find('div.progress').removeClass('progress-striped')
            container.find('div.progress').removeClass('active')
            if(scopusnet_data){
                D.dispatchEvent('update_dataTable', {
                    'dataTable': scopusnet_data
                })
                D.dispatchEvent('task_success', {})
            } else {
                D.dispatchEvent('task_fail', {})
            }
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
    
    // Alerts
    D.addModule(function(){
        domino.module.call(this)

        this.triggers.events['networkJson_updated'] = function(){
            var networkJson = D.get('networkJson')
            $('#alerts').append(
                $('<div class="alert"/>')
                    .addClass('alert-success')
                    .append(
                        $('<span/>').text('You obtained a filtered network of '+networkJson.nodes.length+' nodes and '+networkJson.edges.length+' links (removed nodes not counted)')
                    ).append(
                        $('<button type="button" class="close" data-dismiss="alert">&times;</button>')
                    )
            )
        }

        this.triggers.events['mostConnectedNodesRemoved_updated'] = function(){
            $('#alerts').append(
                $('<div class="alert"/>')
                    .addClass('alert-warning')
                    .append(
                        $('<span/>').text('Most connected nodes removed: '+D.get('mostConnectedNodesRemoved').map(function(node){return node.label}).join(', '))
                    ).append(
                        $('<button type="button" class="close" data-dismiss="alert">&times;</button>')
                    )
            )
        }

        this.triggers.events['poorlyConnectedNodesRemoved_updated'] = function(){
            $('#alerts').append(
                $('<div class="alert"/>')
                    .addClass('alert-warning')
                    .append(
                        $('<span/>').text(D.get('poorlyConnectedNodesRemoved').length+' nodes were removed because they did not have enough neighbours')
                    ).append(
                        $('<button type="button" class="close" data-dismiss="alert">&times;</button>')
                    )
            )
        }
    })

    // Type of network
    D.addModule(function(){
        domino.module.call(this)

        var container = $('#typeofnet')

        $(document).ready(function(e){
            container.html('<form><fieldset><label>Type of network</label><select class="input-block-level" disabled></select></fieldset></form>')
        })
        
        this.triggers.events['dataTable_updated'] = function(){
            var networkOptions = []
                ,data = D.get('dataTable')
                ,authorsColumn
                ,authorKeywordsColumn
            
            data[0].forEach(function(d, i){
                if(d == 'Authors')
                    authorsColumn = i
                if(d == 'Author Keywords')
                    authorKeywordsColumn = i
            })

            if( authorsColumn !== undefined && authorKeywordsColumn !== undefined )
                networkOptions.push({
                    label: 'Authors and Keywords (from authors)'
                    ,types: ['Authors', 'Author Keywords']
                    ,settings: {
                        mode: 'bipartite'
                        ,nodesColumnId1: authorsColumn
                        ,nodesSeparator1: ','
                        ,nodesColumnId2: authorKeywordsColumn
                        ,nodesSeparator2: ';'
                    }
                })

            D.dispatchEvent('update_networkOptions', {
                'networkOptions': networkOptions
            })
        }

        this.triggers.events['networkOptions_updated'] = function(){
            var networkOptions = D.get('networkOptions')
            container.find('select').html('').append(
                networkOptions.map(function(option, i){
                    return $('<option/>').attr('value',i).text(option.label)
                })
            ).removeAttr('disabled')
        }
    })

    // Build button
    D.addModule(function(){
        domino.module.call(this)

        var container = $('#build')

        $(document).ready(function(e){
            container.html('<div style="height: 35px"><button class="btn btn-block disabled"><i class="icon-cog"></i> Build network</button></div><div style="height: 25px;"><div class="progress progress-striped active"><div class="bar" style="width: 0%;"></div></div></div>')
        })
        
        this.triggers.events['networkOptions_updated'] = function(){
            var button = container.find('button')
                ,progress = container.find('div.progress')
                ,bar = progress.find('div.bar')
            button.removeClass('disabled').click(function(){
                if(!button.hasClass('disabled')){
                    button.addClass('disabled')
                    progress.show()
                    bar.css('width', '100%').text('Building...')
                    D.dispatchEvent('build_pending', {})
                }
            })
        }

        this.triggers.events['build_pending'] = function(){
            var networkOptions = D.get('networkOptions')
                ,data = D.get('dataTable')
                ,optionId = $('#typeofnet').find('select').val()
                ,option = networkOptions[optionId]

            option.settings.jsonCallback = function(json){
                D.dispatchEvent('build_success', {})
                json.attributes.description = 'Network extracted from a Scopus file on ScienceScape ( http://tools.medialab.sciences-po.fr/sciencescape )'
                json_graph_api.buildIndexes(json)

                var mostConnectedNodesRemoved = []
                if(D.get('removeMostConnected')){
                    // Cleaning
                    var highestDegree = d3.max(json.nodes.map(function(node){return node.inEdges.length + node.outEdges.length}))
                    json.nodes.forEach(function(node){
                        if(node.inEdges.length + node.outEdges.length > 0.7 * highestDegree){
                            mostConnectedNodesRemoved.push(node)
                            node.hidden = true
                        }
                    })
                    json_graph_api.removeHidden(json)
                }
                D.dispatchEvent('update_mostConnectedNodesRemoved', {
                    mostConnectedNodesRemoved: mostConnectedNodesRemoved
                })

                var threshold = D.get('minDegreeThreshold')
                    ,poorlyConnectedNodesRemoved = []
                if(threshold>0){
                    // Recursive cleaning
                    var modif = true
                    while(modif){
                        modif = false
                        json.nodes.forEach(function(node){
                            if(node.inEdges.length + node.outEdges.length < threshold){
                                modif = true
                                node.hidden = true
                                poorlyConnectedNodesRemoved.push(node)
                            }
                        })
                        json_graph_api.removeHidden(json)
                    }
                }

                D.dispatchEvent('update_poorlyConnectedNodesRemoved', {
                    poorlyConnectedNodesRemoved: poorlyConnectedNodesRemoved
                })

                D.dispatchEvent('update_networkJson', {
                    networkJson: json
                })

                
            }
            table2net.buildGraph(data, option.settings)

        }
        this.triggers.events['build_success'] = function(){
            var button = container.find('button')
                ,progress = container.find('div.progress')
                ,bar = progress.find('div.bar')
            button.removeClass('disabled')
            progress.removeClass('progress-striped').removeClass('active')
            bar.addClass('bar-success').text('Build successful')
        }
    })

    // Settings
    D.addModule(function(){
        domino.module.call(this)

        $(document).ready(function(e){
            $('#removeMostConnected').attr('checked', D.get('removeMostConnected'))
                .click(function(){
                    D.dispatchEvent('update_removeMostConnected', {removeMostConnected: $('#removeMostConnected').attr('checked')})
                })
        })

        $(document).ready(function(e){
            $('#minDegreeThreshold').val(D.get('minDegreeThreshold'))
                .change(function(){
                    D.dispatchEvent('update_minDegreeThreshold', {minDegreeThreshold: $('#minDegreeThreshold').val()})
                })
        })
    })

    // Preview network (sigma)
    D.addModule(function(){
        domino.module.call(this)

        var container = $('#sigmaDiv')

        $(document).ready(function(e){
            container.html('<div class="buttons-container"><button class="btn" id="stop-layout">Stop Layout</button><button class="btn" id="rescale-graph">Rescale Graph</button></div><div class="sigma-parent"><div class="sigma-expand" id="sigma-example"></div></div>')
        })

        this.triggers.events['networkJson_updated'] = function(){
            var json = D.get('networkJson')
                ,networkOptions = D.get('networkOptions')
                ,optionId = $('#typeofnet').find('select').val()
                ,option = networkOptions[optionId]
                ,colors = ["#637CB5", "#C34E7B", "#66903C", "#C55C32", "#B25AC9"]
                ,colorsByType = {}

            option.types.forEach(function(type, i){
                colorsByType[type] = colors[i]
            })

            // Instanciate sigma.js and customize it :
            sigmaInstance = sigma.init(document.getElementById('sigma-example')).drawingProperties({
                defaultLabelColor: '#666'
                ,edgeColor: 'default'
                ,defaultEdgeColor: '#ccc'
            })

            console.log('At sigma inst: ', 'json.nodes.length', json.nodes.length, 'json.nodes_byId', Object.keys(json.nodes_byId).length)
            json.nodes.forEach(function(node){
                sigmaInstance.addNode(node.id,{
                    'x': Math.random()
                    ,'y': Math.random()
                    ,label: node.label
                    ,size: 1 + 0.1 * Math.sqrt(node.inEdges.length + node.outEdges.length)
                    ,'color': colorsByType[node.attributes_byId['attr_type']]
                })
            })

            json.edges.forEach(function(link, i){
                sigmaInstance.addEdge(i,link.sourceID,link.targetID)
            })

            // Start the ForceAtlas2 algorithm
            sigmaInstance.startForceAtlas2()

            var isRunning = true;
            document.getElementById('stop-layout').addEventListener('click',function(){
                if(isRunning){
                    isRunning = false;
                    sigmaInstance.stopForceAtlas2();
                    document.getElementById('stop-layout').childNodes[0].nodeValue = 'Start Layout';
                }else{
                    isRunning = true;
                    sigmaInstance.startForceAtlas2();
                    document.getElementById('stop-layout').childNodes[0].nodeValue = 'Stop Layout';
                }
            },true)
            document.getElementById('rescale-graph').addEventListener('click',function(){
                sigmaInstance.position(0,0,1).draw();
            },true)

            D.dispatchEvent('update_sigmaInstance', {
                sigmaInstance: sigmaInstance
            })
        }
    })
    
    // Download graph button     
    D.addModule(function(){
        domino.module.call(this)

        var container = $('#download')

        $(document).ready(function(e){
            container.html('<div style="height: 25px"><button class="btn btn-block disabled"><i class="icon-download"></i> Download network</button></div>')
        })
        
        this.triggers.events['networkJson_updated'] = function(){
            var button = container.find('button')

            button.removeClass('disabled').click(function(){
                if(!button.hasClass('disabled')){
                    button.addClass('disabled')
                    
                    var json = D.get('networkJson')

                    // Get layout properties from sigma
                    var sigmaInstance = D.get('sigmaInstance')
                    sigmaInstance.iterNodes(function(sigmaNode){
                        var node = json.nodes_byId[sigmaNode.id]
                        if(node === undefined){
                            console.log('Cannot find node '+sigmaNode.id)
                            sigmaNode.color = '#FF0000'
                        } else {
                            // console.log('Can find node '+sigmaNode.id)
                            node.x = sigmaNode.x
                            node.y = sigmaNode.y
                            node.size = sigmaNode.size
                            var rgb = chroma.hex(sigmaNode.color).rgb
                            node.color = {r:rgb[0], g:rgb[1], b:rgb[2]}
                        }
                    })

                    // Download
                    var blob = new Blob(json_graph_api.buildGEXF(json), {'type':'text/gexf+xml;charset=utf-8'})
                        ,filename = "Network.gexf"
                    if(navigator.userAgent.match(/firefox/i))
                       alert('Note:\nFirefox does not handle file names, so you will have to rename this file to\n\"'+filename+'\""\nor some equivalent.')
                    saveAs(blob, filename)
                }
            })
        }
    })


    //// Data processing
    function downloadScopusextract(){
        var authorsColumn
            ,authorKeywordsColumn
        scopusnet_data[0].forEach(function(d, i){
            if(d == 'Authors')
                authorsColumn = i
            if(d == 'Author Keywords')
                authorKeywordsColumn = i
        })
        if(!$('#scopusextractlinks_download').hasClass('disabled')){
            table2net.buildGraph(scopusnet_data, {
                mode: 'bipartite'
                ,nodesColumnId1: authorsColumn
                ,nodesSeparator1: ','
                ,nodesColumnId2: authorKeywordsColumn
                ,nodesSeparator2: ';'
            })

            /*var headers = scopusnet_data.shift()

            var content = []
            
            content.push(headers.map(function(header){
                return '"' + header.replace(/"/gi, '""') + '"';
            }).join(","));
            
            scopusnet_data.forEach(function(items){
                content.push("\n" + items.map(function(item){
                    var cell = item || '';
                    return '"' + cell.replace(/"/gi, '""') + '"';
                }).join(","));
            });
            
            $("#progress_bar_message").addClass("success_message");
            $("#validation").addClass("open");
            setTimeout('$("#progress_bar").removeClass("loading");', 2000);
            
            // Save file
            var blob = new Blob(content, {'type':'application/gexf+xml;charset=utf-8'})
                ,filename = "Scopus network.gexf"
            if(navigator.userAgent.match(/firefox/i))
               alert('Note:\nFirefox does not handle file names, so you will have to rename this file to\n\"'+filename+'\""\nor some equivalent.')
            saveAs(blob, filename)
            
            */

        }
    }

    function build_scopusDoiLinks(csv){
        return build_DoiLinks(csv, d3.csv.parseRows, 'References', 'Cited papers having a DOI')
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


