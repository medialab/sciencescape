domino.settings({
	shortcutPrefix: "::" // Hack: preventing a bug related to a port in a URL for Ajax
	,verbose: false
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
				id:'inputCSVfileUploader'
				,dispatch: 'inputCSVfileUploader_updated'
				,triggers: 'update_inputCSVfileUploader'
      },{
        id:'referencesHash'
        ,dispatch: 'referencesHash_updated'
        ,triggers: 'update_referencesHash'
			},{
				id:'dataTable'
				,dispatch: 'dataTable_updated'
				,triggers: 'update_dataTable'
			},{
				id:'networkJson'
				,dispatch: 'networkJson_updated'
				,triggers: 'update_networkJson'
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
				id:'layoutRunning'
				,type: 'boolean'
				,value: false
				,dispatch: 'layoutRunning_updated'
				,triggers: 'update_layoutRunning'
			}
		],services: [
		],hacks:[
			{
				// Events that need to be declared somewhere
				triggers: [
						'sigmaInstance_updated'

						// Loading and parsing process
						,'loading_started'
						,'loading_completed'
            ,'parse'
						,'parsing_processing'
						,'parsing_success'
						,'parsing_fail'
            ,'compute'
            ,'start_computing'

						,'build_processing'
						,'build_success'
						,'build_fail'
					]
			},{
        // When the file is loaded, trigger the parsing
        triggers: ['loading_completed']
        ,method: function(e){
          this.dispatchEvent('parse')
        }
      },{
        // When the file is parsed, trigger the computing
        triggers: ['dataTable_updated']
        ,method: function(e){
          this.dispatchEvent('compute')
        }
      },{
				triggers: ['ui_toggleLayoutRunning']
				,method: function(e){
					this.update('layoutRunning', !this.get('layoutRunning'))
				}
			},{
				triggers: ['ui_rescaleGraph']
				,method: function(e){
					var sigmaInstance = this.get('sigmaInstance')
					if(sigmaInstance !== undefined){
            var cam = sigmaInstance.cameras[0];

            sigma.misc.animation.camera(
              cam,
              {x: 0, y: 0, angle: 0, ratio: 1},
              { duration: 150 }
            );
          }
				}
			}
		]
	})

	//// Modules

	// File loader
	D.addModule(function(){
		domino.module.call(this)

		var _self = this
			,container = $('#scopusextract')

		$(document).ready(function(e){
			container.html('<div style="height: 50px"><div class="input"><input type="file" name="file"/><span class="help-block">Note: you can drag and drop a file</span></div><div class="progress" style="display: none;"><div class="bar" style="width: 0%;"></div></div></div>')
			container.find('input').on('change', function(evt){
				var target = evt.target || evt.srcElement
				_self.dispatchEvent('update_inputCSVfiles', {
					inputCSVfiles: target.files
				})
			})
		})

		
		this.triggers.events['inputCSVfiles_updated'] = function(provider, e){
			var files = provider.get('inputCSVfiles')
			if( files !== undefined && files.length >0 ){
				container.find('div.input').hide()
				container.find('div.progress').show()
				var bar = container.find('div.progress .bar')
				bar.css('width', '0%')
				
				var fileLoader = new FileLoader()
				_self.dispatchEvent('update_inputCSVfileUploader', {
					inputCSVfileUploader: fileLoader
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

		this.triggers.events['loading_started'] = function(provider, e){
			var bar = container.find('div.progress .bar')
			bar.removeClass("bar-success")
			bar.removeClass("bar-warning")
		}

		this.triggers.events['loading_completed'] = function(provider, e){
			var progressElement = container.find('div.progress')
				,bar = progressElement.find('div.bar')
			bar.addClass('bar-success')
			bar.css('width', '100%')
			bar.text('Reading: 100%')
		}

		this.triggers.events['uploadAndParsing_success'] = function(provider, e){
			container.html('<span class="tex-success">File uploaded and parsed successfully</span>')
		}
	})
	
	// Parsing progress bar (applies to the loading progress bar)
	D.addModule(function(){
		domino.module.call(this)

		var _self = this
			,container = $('#scopusextract')    // We reuse the uploader progress bar

		this.triggers.events['parse'] = function(provider, e){
			var progressElement = container.find('div.progress')
				,bar = progressElement.find('div.bar')
			progressElement.addClass('progress-striped')
			progressElement.addClass('active')
			bar.removeClass('bar-success')
			bar.css('width', '100%')
			bar.text('Parsing...')
			setTimeout(function(){
				_self.dispatchEvent('parsing_processing')
			}, 800)
		}

		this.triggers.events['parsing_success'] = function(provider, e){
			var progressElement = container.find('div.progress')
				,bar = progressElement.find('div.bar')
			progressElement.removeClass('progress-striped')
			bar.addClass('bar-success')
			bar.text('Parsing successful')
			setTimeout(function(){
				_self.dispatchEvent('uploadAndParsing_success')
			}, 500)
		}

		this.triggers.events['parsing_fail'] = function(provider, e){
			var progressElement = container.find('div.progress')
				,bar = progressElement.find('div.bar')
			progressElement.removeClass('progress-striped')
			bar.addClass('bar-danger')
			bar.text('Parsing failed')
		}
	})

	// Processing: parsing
	D.addModule(function(){
		domino.module.call(this)

		var _self = this

		this.triggers.events['parsing_processing'] = function(provider, e){
			var fileLoader = provider.get('inputCSVfileUploader')
			,parsing = parse_csv(fileLoader.reader.result)

      if(parsing.table){
				setTimeout(function(){
          _self.dispatchEvent('update_referencesHash', {
            'referencesHash': parsing.referencesHash
          })
          _self.dispatchEvent('update_dataTable', {
            'dataTable': parsing.table
          })
				}, 200)

				// _self.dispatchEvent('parsing_success', {})
			} else {
				_self.dispatchEvent('parsing_fail', {})
			}
		}
	})

  // Computing progress bar (applies to the loading progress bar)
  D.addModule(function(){
    domino.module.call(this)

    var _self = this
      ,container = $('#scopusextract')    // We reuse the uploader progress bar

    this.triggers.events['compute'] = function(provider, e){
      var progressElement = container.find('div.progress')
        ,bar = progressElement.find('div.bar')
      progressElement.addClass('progress-striped')
      progressElement.addClass('active')
      bar.removeClass('bar-success')
      bar.css('width', '100%')
      bar.text('Computing... (may take a while)')
    }

    this.triggers.events['update_networkJson'] = function(provider, e){
      var progressElement = container.find('div.progress')
        ,bar = progressElement.find('div.bar')
      progressElement.removeClass('progress-striped')
      bar.addClass('bar-success')
      bar.text('Computing successful')
    }

  })
  
  // Build
  D.addModule(function(){
    domino.module.call(this)

    var _self = this

    this.triggers.events['compute'] = function(provider, e){
      setTimeout(function(){
        _self.dispatchEvent('start_computing')
      }, 1000)
    }

    this.triggers.events['start_computing'] = function(provider, e){
      var data = provider.get('dataTable')
      ,referencesHash = provider.get('referencesHash')
      ,titleColumn
      ,authorsColumn
      ,authorKeywordsColumn
      ,sourceTitleColumn
      ,abbrSourceTitleColumn
      ,doiCitedColumn
      ,doiColumn
      ,languageColumn
      ,doctypeColumn
      ,citedByColumn
      ,correspondenceAddressColumn
      ,affiliationsColumn
      ,refColumn = data[0].length - 1
        
      data[0].forEach(function(d, i){
        if(d == 'Title')
          titleColumn = i
        if(d == 'Authors')
          authorsColumn = i
        if(d == 'Author Keywords')
          authorKeywordsColumn = i
        if(d == 'Source title')
          sourceTitleColumn = i
        if(d == 'Abbreviated Source Title')
          abbrSourceTitleColumn = i
        if(d == 'Cited papers having a DOI')
          doiCitedColumn = i
        if(d == 'DOI')
          doiColumn = i
        if(d == 'Language of Original Document')
          languageColumn = i
        if(d == 'Document Type')
          doctypeColumn = i
        if(d == 'Cited by')
          citedByColumn = i
        if(d == 'Correspondence Address')
          correspondenceAddressColumn = i
        if(d == 'Affiliations')
          affiliationsColumn = i
      })

      // Get the ref network
      var settings = {
        mode: 'normal'
        ,nodesColumnId: refColumn
        ,nodesSeparator: ';'
        ,nodesMetadataColumnIds: []
        ,linksColumnId: titleColumn
        ,jsonCallback: function(ref_json){
          
          // Adding AUTHORS
          var settings = {
            mode: 'bipartite'
            ,nodesColumnId1: refColumn
            ,nodesSeparator1: ';'
            ,nodesMetadataColumnIds1: []
            ,nodesColumnId2: authorsColumn
            ,nodesSeparator2: ','
            ,nodesMetadataColumnIds2: []
            ,jsonCallback: function(author_json){
              
              // Adding KEYWORDS (author keywords)
              var settings = {
                mode: 'bipartite'
                ,nodesColumnId1: refColumn
                ,nodesSeparator1: ';'
                ,nodesMetadataColumnIds1: []
                ,nodesColumnId2: authorKeywordsColumn
                ,nodesSeparator2: ';'
                ,nodesMetadataColumnIds2: []
                ,jsonCallback: function(kw_json){

                  // Adding SOURCES
                  var settings = {
                    mode: 'bipartite'
                    ,nodesColumnId1: refColumn
                    ,nodesSeparator1: ';'
                    ,nodesMetadataColumnIds1: []
                    ,nodesColumnId2: sourceTitleColumn
                    ,nodesMetadataColumnIds2: []
                    ,jsonCallback: function(source_json){

                      // Filter networks
                      console.log((new Date()).toLocaleString() + ' Filtering networks')
                      filterAutoLinks(ref_json)
                      filterAutoLinks(author_json)
                      filterAutoLinks(kw_json)
                      filterAutoLinks(source_json)
                      filterNetworkByDegree(ref_json, 0.1 /* 10% */, 100, 1000)
                      filterNetworkByOccurrences(author_json, 'Authors', 3)
                      filterNetworkByOccurrences(kw_json, 'Author Keywords', 3)
                      filterNetworkByOccurrences(source_json, 'Source title', 5)

                      var json = ref_json

                      // Merge all the jsons in json
                      console.log((new Date()).toLocaleString() + ' Merging networks')
                      mergeNetworks(author_json, json)
                      mergeNetworks(kw_json, json)
                      mergeNetworks(source_json, json)

                      // Filter the result to remove leaves and orphans
                      filterNetworkRemoveLeavesAndOrphans(json)

                      // Put a good name and the right size to ref nodes
                      console.log('referencesHash', referencesHash)
                      json.nodes.forEach(function(n){
                        if(n.attributes[0].val == "References ID"){
                          n.size = 1
                          var refKey = n.label.toUpperCase().split('-')
                          ,components = referencesHash[refKey[0]][refKey[1]].components
                          ,name = (components.authors || ['Unknown authors'])
                            .map(function(str){
                              var el = str.trim().replace(',', '').split(' ')
                              return (el[1] || '').replace('.', '. ') + '. ' + (el[0] || '')
                            })
                            .map(titleCase).join(', ')
                            + '. '
                            + sentenceCase(components.title || components.title_plus || 'Unknown title').trim()
                            + ', '
                            + (components.date || 'Unknown date')
                          n.label = name
                        }
                      })

                      // Build indexes
                      json_graph_api.buildIndexes(json)

                      // Add the dependency level (for sigma)
                      json.nodes.forEach(function(n){
                        n.dlevel = (n.attributes_byId['attr_type'] == "References ID") ? (0) : (1)
                      })

                      console.log((new Date()).toLocaleString() + ' Processing finished')
                      console.log('network', json)

                      if(json.nodes.length == 0){
                        alert('The result is an empty network')
                      }
                      _self.dispatchEvent('update_networkJson', {
                        networkJson: json
                      })

                    }
                  }

                  console.log((new Date()).toLocaleString() + ' Building SOURCES network')
                  table2net.buildGraph(data, settings)

                }
              }

              console.log((new Date()).toLocaleString() + ' Building KW network')
              table2net.buildGraph(data, settings)

            }
          }

          console.log((new Date()).toLocaleString() + ' Building AUTH network')
          table2net.buildGraph(data, settings)

        }
      }

      console.log((new Date()).toLocaleString() + ' Building REF network')
      table2net.buildGraph(data, settings)
    }

  })

	// Sigma: Preview network
	D.addModule(function(){
		domino.module.call(this)

		var _self = this
			,container = $('#sigmaContainer')

		$(document).ready(function(e){
			container.html('<div class="sigma-parent"><div class="sigma-expand" id="sigma-example"></div></div>')
		})

		this.triggers.events['networkJson_updated'] = function(provider, e){
			$('#networkDiv').show()

			var json = provider.get('networkJson')
				,networkOptions = provider.get('networkOptions')
				,colors = ["#637CB5", "#C34E7B", "#66903C", "#C55C32", "#B25AC9"]
				,colorsByType = {
          'References ID': '#CCC'
          ,'Authors': '#637CB5'
          ,'Source title': '#C34E7B'
          ,'Author Keywords': '#66903C'
        }

			// Kill old sigma if needed
			// var oldSigmaInstance = provider.get('sigmaInstance')
			// if(oldSigmaInstance !== undefined){
			// 	_self.dispatchEvent('update_layoutRunning', {
			// 		layoutRunning: !provider.get('layoutRunning')
			// 	})
			// 	oldSigmaInstance.emptyGraph() // .kill() is not currently implemented
			// 	container.find('#sigma-example').html('')
			// }

			// Instanciate sigma.js and customize it
			var sigmaInstance = new sigma({
        container: 'sigma-example'
        ,settings:{
          defaultLabelColor: '#666'
          ,edgeColor: 'default'
          ,defaultEdgeColor: '#ccc'
          ,defaultNodeColor: '#999'
          ,hideEdgesOnMove: true
          ,font: 'Roboto Condensed'
          ,fontStyle: '300'
          ,defaultLabelSize: 13
          ,minEdgeSize: 1.5
          ,maxEdgeSize: 1.5
          ,maxNodeSize: 8
          ,defaultEdgeColor: '#ddd'
          ,defaultNodeColor: '#ccc'
          ,edgeColor: 'default'
          ,rescaleIgnoreSize: false
          ,labelThreshold: 8
          ,singleHover: true
          ,zoomMin: 0.002
          ,zoomMax: 2
        }
      })

			// Populate
			json.nodes.forEach(function(node){
				sigmaInstance.graph.addNode({
					id: node.id
          ,x: Math.random()
					,y: Math.random()
					,label: node.label
					,size: node.size || 1 + Math.log(1 + 0.1 * ( node.inEdges.length + node.outEdges.length ) )
					,'color': colorsByType[node.attributes_byId['attr_type']] || '#000'
          ,dlevel: node.dlevel
				})
			})
			json.edges.forEach(function(link, i){
				sigmaInstance.graph.addEdge({
          id: +i
          ,source: link.sourceID
          ,target: link.targetID
        })
			})

			_self.dispatchEvent('update_sigmaInstance', {
				sigmaInstance: sigmaInstance
			})

			// Start the ForceAtlas2 algorithm
			_self.dispatchEvent('update_layoutRunning', {
				layoutRunning: true
			})
		}
	})
	
	// ForceAtlas
	D.addModule(function(){
		domino.module.call(this)

		var _self = this

		this.triggers.events['layoutRunning_updated'] = function(provider, e){
			var sigmaInstance = provider.get('sigmaInstance')
				,layoutRunning = provider.get('layoutRunning')
			if(layoutRunning){
				sigmaInstance.startForceAtlas2({
          barnesHutOptimize: false  // Mandatory in the tweaked version
          ,gravity: 0.05
          ,startingIterations: 50
          ,iterationsPerRender: 10

          // FA2
          // ,scalingRatio: 10
          // ,strongGravityMode: true
          // ,slowDown: 2

          // LinLog
          ,linLogMode: true
          ,scalingRatio: 0.8
          ,strongGravityMode: false
          ,slowDown: 1
        })
			} else {
				sigmaInstance.stopForceAtlas2()
			}
		}
	})

	// Sigma buttons
	D.addModule(function(){
		domino.module.call(this)

		var _self = this
			,container = $('#sigmaButtons')

		$(document).ready(function(e){
			container.html('<div class="btn-group"><button class="btn btn-small" id="layoutSwitch">Stop Layout</button> <button class="btn btn-small" id="rescaleGraph"><i class="icon-resize-full"/> Rescale Graph</button></div>')
			
			container.find('#layoutSwitch').click(function(){
				_self.dispatchEvent('ui_toggleLayoutRunning')
			})
			container.find('#rescaleGraph').click(function(){
				_self.dispatchEvent('ui_rescaleGraph')
			})

			_self.dispatchEvent('sigmaInstance_updated')
		})

		function updateLayoutSwitch(provider, e){
			var button = container.find('#layoutSwitch')
				,layoutRunning = provider.get('layoutRunning')
				,sigmaInstance = provider.get('sigmaInstance')
			if(sigmaInstance === undefined){
				button.html('<i class="icon-play"/> Start layout')
				button.addClass('disabled')
			} else {
				button.removeClass('disabled')
				if(layoutRunning){
					button.html('<i class="icon-stop"/> Stop layout')
				} else {
					button.html('<i class="icon-play"/> Start layout')
				}
			}
		}

		function updateRescaleGraph(provider, e){
			var button = container.find('#rescaleGraph')
				,sigmaInstance = provider.get('sigmaInstance')
			if(sigmaInstance === undefined){
				button.addClass('disabled')
			} else {
				button.removeClass('disabled')
			}
		}

		this.triggers.events['sigmaInstance_updated'] = function(provider, e){
			updateLayoutSwitch(provider, e)
			updateRescaleGraph(provider, e)
		}

		this.triggers.events['layoutRunning_updated'] = function(provider, e){
			updateLayoutSwitch(provider, e)
		}
	})
	
	// Download graph button     
	D.addModule(function(){
		domino.module.call(this)

		var _self = this
			,container = $('#download')

		$(document).ready(function(e){
			container.html('<div><button class="btn btn-small btn-primary disabled"><i class="icon-download icon-white"></i> Download network</button></div>')
		})
		
		this.triggers.events['networkJson_updated'] = function(provider, e){
			var button = container.find('button')

			button.removeClass('disabled').click(function(){
				if(!button.hasClass('disabled')){
					button.addClass('disabled')
					
					var json = provider.get('networkJson')

					// Get layout properties from sigma
					var sigmaInstance = provider.get('sigmaInstance')
					sigmaInstance.graph.nodes().forEach(function(sigmaNode){
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
	function parse_csv(csv){
		var table = build_DoiLinks(csv, d3.csv.parseRows, 'References', 'Cited papers having a DOI')

    // We extract and clean references
    var referencesHash = cleanReferences(table)

    return {table: table, referencesHash: referencesHash}
  }

  function cleanReferences(table){

    var referencesColumn = -1
    table[0].forEach(function(cell, i){
      if(cell == "References"){
        referencesColumn = i;
      }
    })

    if(referencesColumn < 0){  // We need a references column
      alert('References\' column not found')
      return undefined
    }

    var referencesHash = {}

    table.forEach(function(row, row_i){
      
      if(row_i == 0){

        row.push('References ID')
      
      } else {
        
        var cell = row[referencesColumn]
        ,tokenizedReferences = []

        if(cell.trim().length == 0){
          // No reference to parse
        } else {
          var firstList = cell.split(';')

          // We assume that the semicolon is not used inside references.
          // However we know that some references may not be separated by
          // a semicolon: we will split again
          firstList.forEach(function(candidate){

            // We count the dates to take a decision
            var matchings = candidate.match(/\(([12][9801][0-9][0-9])\)/g) || []
            ,datesCount = matchings.length

            if(datesCount == 1){

              // One date: the candidate is valid
              tokenizedReferences.push(candidate)

            } else if(datesCount == 0){

              // No date: we have an issue
              // console.log('[parsing issue] Ref without date row '+row_i+':', candidate)

            } else  {

              // More than one date: we have to split again

              // First we search for a pattern where references have been
              // concatenated without any separator. In such a case, we have
              // a chance to fix it by searching a string with a
              // lowercaseUppercase pattern
              var fixedConcatenation = candidate.replace(/([a-z])([A-Z])/g, '$1;$2')
              ,newCandidates = fixedConcatenation.split(';')

              if(newCandidates.length != datesCount){

                // We do not have as many new candidates as dates
                // console.log('[parsing issue] Multiple dates but split failed row '+row_i, candidate)

              } else {

                // We fixed it
                tokenizedReferences = tokenizedReferences.concat(newCandidates)

              }
            }
          })
        }

        // References have been separated (with false negatives)
        // and we have to clean them in order to make them comparable
        // Our strategy is to build a key for each reference

        var referencesKeys = tokenizedReferences.map(function(reference){
          var refComp = extractReferenceComponents(reference)
          ,key = indexReference(
            refComp
            ,referencesHash
            ,5 // LEVENSHTEIN THRESHOLD !!!
          )
          return key
        })
        
        row.push(referencesKeys.filter(function(d){return d !== undefined}).join(';'))

      }
    })
    
    // Now we will filter out references that have not been indexed several times
    var remainingReferences = {}
    for(key in referencesHash){
      var ref = referencesHash[key]
      for(i in ref){
        if(ref[i].count > 1){
          remainingReferences[ref[i].key] = true
        }
      }
    }
    table.forEach(function(row, row_i){
      if(row_i > 0){
        var refs = row[row.length - 1].split(';')
        row[row.length - 1] = refs
          .filter(function(r){
            return remainingReferences[r]
          })
          .join(';')
      }
    })

    return referencesHash
  }

  function checkDistance(comp1, comp2){
    var t1 = ''
    ,t2 = ''

    if(comp1.title){
      t1 = comp1.title.trim().toLowerCase().substr(0, 250)
    } else if(comp1.title_plus){
      t1 = comp1.title_plus.trim().toLowerCase().substr(0, 50)
    }

    if(comp2.title){
      t2 = comp2.title.trim().toLowerCase().substr(0, 250)
    } else if(comp2.title_plus){
      t2 = comp2.title_plus.trim().toLowerCase().substr(0, 50)
    }

    return getEditDistance(t1, t2)
  }

  function indexReference(components, refIndex, levenshteinThreshold){
    if(components === undefined)
      return

    var trivialKey = buildRefKey(components)
    ,key

    if(refIndex[trivialKey] === undefined){

      // It's the first time this ref is indexed
      key = trivialKey + '-0'
      refIndex[trivialKey] = {0:{key:key, components: components, count: 1}}
      return key

    } else {

      // It's already in the index:
      // We'll have to identify if it matches some of previous indexes

      // we search for the same key
      var minD = Number.MAX_VALUE
      ,minId = -1
      ,id

      for(id in refIndex[trivialKey]){
        var key = refIndex[trivialKey][id].key
        ,components2 = refIndex[trivialKey][id].components
        ,d = checkDistance(components, components2)

        if(d < minD){
          minD = d
          minId = id
        }
      }

      id = Number.parseInt(id)+1

      if(minD < levenshteinThreshold){

        // console.log('matching')

        // We have a matching: we merge by returning the other's key
        key = trivialKey + '-' + minId
        refIndex[trivialKey][minId].count++
        return key

      } else {

        // No match: we just add...
        key = trivialKey + '-' + id
        refIndex[trivialKey][id] = {key:key, components: components, count:1}
        return key

      }

    }
  }

  function buildRefKey(components){
    if(components === undefined)
      return

    var authorsShort = []
    if(components.authors.length < 2){
      authorsShort.push(
        (components.authors[0] || '').split(',')[0]
        .trim()
        .toUpperCase()
      )
    } else {
      components.authors.forEach(function(author){
        authorsShort.push(
          author
          .trim()
          .substr(0,2)
          .toUpperCase()
        )
      })
    }

    return '' + components.date + '.' + authorsShort.join('.')
  }

  function extractReferenceComponents(reference){
    var matches

    // Different situations may happen

    // Date before title: Toto, D., (2020), My title until a period.
    var pattern1 = /(.*)., \(([12][9801][0-9][0-9])\)[,]?(.*)/

    // Date in title: Toto, D., My title until a parenthesis (2020)
    var pattern2 = /(.*)., ([^\(\.]+)\(([12][9801][0-9][0-9])\)(.*)/

    // Like pattern2 but even more permissive (with periods in title)
    var pattern3 = /(.*)., ([^\(]+)\(([12][9801][0-9][0-9])\)(.*)/
    
    // Reference without author (collective books, reports...)
    var pattern4 = /^\s*\(([12][9801][0-9][0-9])\)[,]?([^,]+),(.*)/
    
    // Test pattern 1
    matches = reference.match(pattern1)
    if(matches){
      return {
        authors: matches[1].split('.,')
        ,date: matches[2]
        ,title_plus: matches[3]
        ,source: reference
        ,pattern: 'date before title'
      }
    }

    // Test pattern 2
    matches = reference.match(pattern2)
    if(matches){
      return {
        authors: matches[1].split('.,')
        ,date: matches[3]
        ,title: matches[2]
        ,plus: matches[4]
        ,source: reference
        ,pattern: 'date in title'
      }
    }

    // Test pattern 3
    matches = reference.match(pattern3)
    if(matches){
      return {
        authors: matches[1].split('.,')
        ,date: matches[3]
        ,title: matches[2]
        ,plus: matches[4]
        ,source: reference
        ,pattern: 'date in title (more permissive)'
      }
    }

    // Test pattern 4
    matches = reference.match(pattern4)
    if(matches){
      return {
        authors: []
        ,date: matches[1]
        ,title: matches[2]
        ,plus: matches[3]
        ,source: reference
        ,pattern: 'no author'
      }
    }

    // console.log('[parsing issue] Unknown Ref Pattern',reference)
    return undefined
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

  function filterNetworkByDegree(graph, keepAtLeast, minCount, maxCount){
    json_graph_api.buildIndexes(graph)

    // Get information about the degrees
    var degreeIndex = {}
    graph.nodes.forEach(function(n){
      var degree = n.inEdges.length + n.outEdges.length
      degreeIndex[degree] = (degreeIndex[degree] || 0) + 1
    })

    var degrees = Object.keys(degreeIndex)
      .map(function(d){return Number.parseInt(d)})
      .sort(function(a,b){
        return a-b 
      })
      .reverse()

    // Define the threshold
    var minDegree = 0
    ,total = graph.nodes.length
    ,keep = 0
    degrees.some(function(degree){

      // We stop if we would have more than the max count
      if(keep + degreeIndex[degree] > maxCount)
        return true
      
      keep += degreeIndex[degree]
      minDegree = degree
      
      // We stop if...
      return keep > keepAtLeast * total && keep >= minCount
    })

    // Filter the nodes
    console.log(graph.nodes.length + ' nodes, minDegree: ' + minDegree)
    var remainingNodes = {}
    graph.nodes = graph.nodes.filter(function(n){
      var degree = n.inEdges.length + n.outEdges.length
      if(degree < minDegree){
        return false
      } else {
        remainingNodes[n.id] = true
        return true
      }
    })
    console.log(graph.nodes.length + ' nodes')
    graph.edges = graph.edges.filter(function(e){
      return remainingNodes[e.sourceID] && remainingNodes[e.targetID]
    })

    graph = json_graph_api.getBackbone(graph)
  }

  function filterAutoLinks(graph){
    graph.edges = graph.edges.filter(function(e){
      return e.sourceID != e.targetID
    })
  }

  function filterNetworkRemoveLeavesAndOrphans(graph){
    json_graph_api.buildIndexes(graph)

    var somethingChanged = false

    // Filter the nodes
    var remainingNodes = {}
    graph.nodes = graph.nodes.filter(function(n){
      var degree = n.inEdges.length + n.outEdges.length
      if(degree < 2){
        somethingChanged = true
        return false
      } else {
        remainingNodes[n.id] = true
        return true
      }
    })
    graph.edges = graph.edges.filter(function(e){
      return remainingNodes[e.sourceID] && remainingNodes[e.targetID]
    })

    graph = json_graph_api.getBackbone(graph)

    if(somethingChanged)
      filterNetworkRemoveLeavesAndOrphans(graph)
  }

  function filterNetworkByOccurrences(graph, type, minOcc){
    
    // Filter the nodes
    var remainingNodes = {}
    graph.nodes = graph.nodes.filter(function(n){
      if(n.attributes[0].val == type && n.attributes[1].val < minOcc){
        return false
      } else {
        remainingNodes[n.id] = true
        return true
      }
    })
    
    graph.edges = graph.edges.filter(function(e){
      return remainingNodes[e.sourceID] && remainingNodes[e.targetID]
    })
  }

  function mergeNetworks(obsoleteGraph, resultGraph){
    obsoleteGraph.nodes.forEach(function(n){
      if(n.attributes[0].val != "References ID"){
        resultGraph.nodes.push(n)
      }
    })
    resultGraph.edges = resultGraph.edges.concat(obsoleteGraph.edges)

    // Filter the nodes
    var remainingNodes = {}
    resultGraph.nodes.forEach(function(n){
      remainingNodes[n.id] = true
    })
    resultGraph.edges = resultGraph.edges.filter(function(e){
      return remainingNodes[e.sourceID] && remainingNodes[e.targetID]
    })
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

  // Compute the edit (levenshtein) distance between the two given strings
  function getEditDistance(a, b) {
    if(a.length === 0) return b.length; 
    if(b.length === 0) return a.length; 
   
    var matrix = [];
   
    // increment along the first column of each row
    var i;
    for(i = 0; i <= b.length; i++){
      matrix[i] = [i];
    }
   
    // increment each column in the first row
    var j;
    for(j = 0; j <= a.length; j++){
      matrix[0][j] = j;
    }
   
    // Fill in the rest of the matrix
    for(i = 1; i <= b.length; i++){
      for(j = 1; j <= a.length; j++){
        if(b.charAt(i-1) == a.charAt(j-1)){
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                         Math.min(matrix[i][j-1] + 1, // insertion
                                  matrix[i-1][j] + 1)); // deletion
        }
      }
    }
   
    return matrix[b.length][a.length];
  };

  function titleCase(string){
    return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()})
  }

  function sentenceCase(string){
    return string.replace(/.*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()})
  }

})(jQuery, domino)


