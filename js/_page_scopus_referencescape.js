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
				id:'layoutRunning'
				,type: 'boolean'
				,value: false
				,dispatch: 'layoutRunning_updated'
				,triggers: 'update_layoutRunning'
			},{
				id:'minDegreeThreshold'
				// ,type: 'integer'
				,value: '1'
				,dispatch: 'minDegreeThreshold_updated'
				,triggers: 'update_minDegreeThreshold'
			},{
				id: 'poorlyConnectedNodesRemoved'
				,dispatch: 'poorlyConnectedNodesRemoved_updated'
				,triggers: 'update_poorlyConnectedNodesRemoved'
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
						,'parsing_primed'
						,'parsing_processing'
						,'parsing_success'
						,'parsing_fail'
						,'uploadAndParsing_success'

						,'build_processing'
						,'build_success'
						,'build_fail'
					]
			},{
        triggers: ['dataTable_updated']
        ,method: function(e){

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
					if(sigmaInstance !== undefined)
						sigmaInstance.position(0,0,1).draw()
				}
			}
		]
	})

	//// Modules

	// Log stuff in the console
	D.addModule(function(){
		domino.module.call(this)

		this.triggers.events['loadingProgress_updated'] = function(provider, e) {
			console.log('Loading progress', provider.get('loadingProgress'))
		}

		this.triggers.events['networkJson_updated'] = function(provider, e) {
			console.log('Network: ', provider.get('networkJson'))
		}
	})

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

			setTimeout(function(){
				_self.dispatchEvent('parsing_primed')
			}, 1000)
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

		this.triggers.events['parsing_primed'] = function(provider, e){
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

	// Show Settings
	D.addModule(function(){
		domino.module.call(this)

		var _self = this
			,container = $('#settingsDiv')

		this.triggers.events['uploadAndParsing_success'] = function(provider, e){
			container.show()
		}

	})
	
	
	// Processing: parsing
	D.addModule(function(){
		domino.module.call(this)

		var _self = this

		this.triggers.events['parsing_processing'] = function(provider, e){
			var fileLoader = provider.get('inputCSVfileUploader')
				,scopusnet_data = parse_csv(fileLoader.reader.result)
			if(scopusnet_data){
				setTimeout(function(){
					_self.dispatchEvent('update_dataTable', {
						'dataTable': scopusnet_data
					})
				}, 200)

				_self.dispatchEvent('parsing_success', {})
			} else {
				_self.dispatchEvent('parsing_fail', {})
			}
		}
	})

	// Report
	D.addModule(function(){
		domino.module.call(this)

		var _self = this
			,container = $('#report')
			,reportContainer = container.find('.reportText')

		this.triggers.events['networkJson_updated'] = function(provider, e){
			var networkJson = provider.get('networkJson')
				,text = ''
				,networkOptions = provider.get('networkOptions')
				,optionId = $('#typeofnet').find('select').val()
				,option = networkOptions[optionId]
				,filteringOption = $('#minDegreeThreshold').find(':selected').text()

			text +=   'Network exported with Scopus2Net - Sciences Po médialab tools'
			text += '\n-------------------------------------------------------------'
			text += '\n'
			text += '\n:: Exported network'
			text += '\nType: '+option.label
			text += '\nNodes: '+networkJson.nodes.length
			text += '\nEdges: '+networkJson.edges.length
			text += '\n(These figures take filtering into account)'
			text += '\n'
			text += '\n:: Filtering'
			text += '\nMode: '+filteringOption
			text += '\nNodes removed: '+provider.get('poorlyConnectedNodesRemoved').length

			reportContainer.text(text)
		}
	})
	
	// Type of network
	D.addModule(function(){
		domino.module.call(this)

		var _self = this
			,container = $('#typeofnet')

		$(document).ready(function(e){
			container.html('<form><fieldset><label>Type of network</label><select class="input-block-level" disabled></select></fieldset></form>')
		})
		
		this.triggers.events['dataTable_updated'] = function(provider, e){
			var networkOptions = []
				,data = provider.get('dataTable')
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

			if( authorsColumn !== undefined && authorKeywordsColumn !== undefined )
				networkOptions.push({
					label: 'Authors and author Keywords, coappearing in the same papers'
					,types: ['Authors', 'Author Keywords']
					,settings: {
						mode: 'bipartite'
						,nodesColumnId1: authorsColumn
						,nodesSeparator1: ','
						,nodesMetadataColumnIds1: [
								sourceTitleColumn
								,abbrSourceTitleColumn
								,languageColumn
								,citedByColumn
								,affiliationsColumn
							].filter(function(d){return d!==undefined})
						,nodesColumnId2: authorKeywordsColumn
						,nodesSeparator2: ';'
						,nodesMetadataColumnIds2: [
								citedByColumn
							].filter(function(d){return d!==undefined})
					}
				})

			if( authorsColumn !== undefined && sourceTitleColumn !== undefined )
				networkOptions.push({
					label: 'Authors and Source Titles, coappearing in the same papers'
					,types: ['Authors', 'Source title']
					,settings: {
						mode: 'bipartite'
						,nodesColumnId1: authorsColumn
						,nodesMetadataColumnIds1: [
								languageColumn
								,citedByColumn
								,affiliationsColumn
							].filter(function(d){return d!==undefined})
						,nodesSeparator1: ','
						,nodesColumnId2: sourceTitleColumn
						,nodesMetadataColumnIds2: [
								abbrSourceTitleColumn
								,citedByColumn
							].filter(function(d){return d!==undefined})
					}
				})

			if( sourceTitleColumn !== undefined && authorKeywordsColumn !== undefined )
				networkOptions.push({
					label: 'Source Titles and author Keywords, coappearing in the same papers'
					,types: ['Author Keywords', 'Source title']
					,settings: {
						mode: 'bipartite'
						,nodesColumnId1: authorKeywordsColumn
						,nodesSeparator1: ';'
						,nodesMetadataColumnIds1: [
								citedByColumn
							].filter(function(d){return d!==undefined})
						,nodesColumnId2: sourceTitleColumn
						,nodesMetadataColumnIds2: [
								abbrSourceTitleColumn
								,languageColumn
								,citedByColumn
							].filter(function(d){return d!==undefined})
					}
				})

			if( authorsColumn !== undefined && titleColumn !== undefined )
				networkOptions.push({
					label: 'Authors linked by co-publication'
					,types: ['Authors']
					,settings: {
						mode: 'normal'
						,nodesColumnId: authorsColumn
						,nodesSeparator: ','
						,nodesMetadataColumnIds: [
								sourceTitleColumn
								,abbrSourceTitleColumn
								,languageColumn
								,citedByColumn
								,affiliationsColumn
							].filter(function(d){return d!==undefined})
						,linksColumnId: titleColumn
					}
				})

			if( doiColumn !== undefined && doiCitedColumn !== undefined && titleColumn !== undefined )
				networkOptions.push({
					label: 'Papers linked by Citations (when they have a DOI)'
					,types: ['DOI']
					,fetchTitles: true
					,settings: {
						mode: 'citation'
						,nodesColumnId: doiColumn
						,nodesMetadataColumnIds: [
								titleColumn
								,sourceTitleColumn
								,abbrSourceTitleColumn
								,languageColumn
								,doctypeColumn
								,citedByColumn
								,correspondenceAddressColumn
								,affiliationsColumn
							].filter(function(d){return d!==undefined})
						,citationLinksColumnId: doiCitedColumn
						,citationLinksSeparator: ';'
					}
				})

			if( authorKeywordsColumn !== undefined && titleColumn !== undefined )
				networkOptions.push({
					label: 'author Keywords coappearing in the same papers'
					,types: ['Author Keywords']
					,settings: {
						mode: 'normal'
						,nodesColumnId: authorKeywordsColumn
						,nodesSeparator: ';'
						,nodesMetadataColumnIds: [
								citedByColumn
							].filter(function(d){return d!==undefined})
						,linksColumnId: titleColumn
					}
				})

			_self.dispatchEvent('update_networkOptions', {
				'networkOptions': networkOptions
			})
		}

		this.triggers.events['networkOptions_updated'] = function(provider, e){
			var networkOptions = provider.get('networkOptions')
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

		var _self = this
			,container = $('#build')

		$(document).ready(function(e){
			container.html('<div style="height: 35px"><button class="btn btn-block disabled"><i class="icon-cog"></i> Build network</button></div><div style="height: 25px;"><div class="progress" style="display:none;"><div class="bar" style="width: 100%;"></div></div></div>')
		})
		
		this.triggers.events['networkOptions_updated'] = function(provider, e){
			var button = container.find('button')
				,progress = container.find('div.progress')
				,bar = progress.find('div.bar')

			progress.addClass('progress-striped').addClass('active')

			button.removeClass('disabled').click(function(){
				if(!button.hasClass('disabled')){
					button.addClass('disabled')
					progress.show()
					progress.addClass('progress-striped').addClass('active')
					bar.removeClass('bar-success')
					bar.css('width', '100%').text('Building...')
					setTimeout(function(){
						_self.dispatchEvent('build_processing', {})
					}, 500)
				}
			})
		}

		this.triggers.events['build_processing'] = function(provider, e){
			var networkOptions = provider.get('networkOptions')
				,data = provider.get('dataTable')
				,optionId = $('#typeofnet').find('select').val()
				,option = networkOptions[optionId]

			option.settings.jsonCallback = function(json){
				_self.dispatchEvent('build_success', {})
				json.attributes.description = 'Network extracted from a Scopus file on ScienceScape ( http://tools.medialab.sciences-po.fr/sciencescape )'
				
				// Sum up the "cited by"
				var citedByIds = []
				json.nodesAttributes.forEach(function(attr){
					if(attr.title == "Cited by"){
						attr.type = 'integer'
						citedByIds.push(attr.id)
						if(citedByIds.length>1){
							attr.title = "Cited by ("+citedByIds.length+")"
						}
					}
				})
				
				if(citedByIds.length>0){
					json.nodes.forEach(function(n){
						n.attributes.forEach(function(attValue){
							if(citedByIds.indexOf(attValue.attr) >= 0){
								if(attValue.val == 'n/a'){
									attValue.val = ''
								} else {
									var valuesList = (attValue.val || "").split('|')
										,total = 0
									valuesList.forEach(function(textValue){
										var numValue = parseInt(textValue)
										if(!isNaN(numValue)){
											total += numValue
										}
									})
									attValue.val = ''+total
								}
							}
						})
					})
				}
				
				// Build indexes
				json_graph_api.buildIndexes(json)

				// Put label for citation mode
				if(option.fetchTitles){
					var titleAttributeId
					json.nodesAttributes.forEach(function(na){
						if(na.title == 'Title')
							titleAttributeId = na.id
					})
					if(titleAttributeId !== undefined)
						json.nodes.forEach(function(node){
							node.label = node.attributes_byId[titleAttributeId]
						})
				}



				var threshold
					,recursive
					,postCleaning
					,poorlyConnectedNodesRemoved = []
				
				switch(''+provider.get('minDegreeThreshold')){
					case '0':
						threshold = 0
						recursive = false
						postCleaning = false
						break
					case '1':
						threshold = 1
						recursive = false
						postCleaning = false
						break
					case '2r':
						threshold = 2
						recursive = true
						postCleaning = false
						break
					case '3':
						threshold = 3
						recursive = false
						postCleaning = false
						break
					case '2dn':
						threshold = 2
						recursive = true
						postCleaning = true
						break
					case '3dn':
						threshold = 3
						recursive = false
						postCleaning = true
						break
					case '4':
						threshold = 4
						recursive = false
						postCleaning = false
						break
					case '5':
						threshold = 5
						recursive = false
						postCleaning = false
						break

				}
				
				if(threshold>0){
					// Recursive cleaning
					var modif = true
					while(modif){
						modif = false
						json.nodes.forEach(function(node){
							if(node.inEdges.length + node.outEdges.length < threshold){
								modif = recursive // Actually recur only if recursive
								node.hidden = true
								poorlyConnectedNodesRemoved.push(node)
							}
						})
						json_graph_api.removeHidden(json)
					}
				}
				// Post cleaning
				if(postCleaning){
					json.nodes.forEach(function(node){
						if(node.inEdges.length + node.outEdges.length < 1){
							node.hidden = true
							poorlyConnectedNodesRemoved.push(node)
						}
					})
					json_graph_api.removeHidden(json)
				}
				

				_self.dispatchEvent('update_poorlyConnectedNodesRemoved', {
					poorlyConnectedNodesRemoved: poorlyConnectedNodesRemoved
				})

				_self.dispatchEvent('update_networkJson', {
					networkJson: json
				})

				
			}
			setTimeout(function(){
				table2net.buildGraph(data, option.settings)
			}, 1000)
			

		}
		this.triggers.events['build_success'] = function(provider, e){
			var button = container.find('button')
				,progress = container.find('div.progress')
				,bar = progress.find('div.bar')
			button.removeClass('disabled')
			progress.removeClass('progress-striped').removeClass('active')
			bar.addClass('bar-success').text('Build successful')
			setTimeout(function(){
				progress.hide()
			}, 2000)
		}
	})

	// Settings
	D.addModule(function(d){
		domino.module.call(this)

		var _self = this

		$(document).ready(function(e){
			$('#minDegreeThreshold').val(d.get('minDegreeThreshold'))
				.change(function(){
					_self.dispatchEvent('update_minDegreeThreshold', {minDegreeThreshold: $('#minDegreeThreshold').val()})
				})
		})
	})

	// Preview network (sigma)
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
				,optionId = $('#typeofnet').find('select').val()
				,option = networkOptions[optionId]
				,colors = ["#637CB5", "#C34E7B", "#66903C", "#C55C32", "#B25AC9"]
				,colorsByType = {}

			option.types.forEach(function(type, i){
				colorsByType[type] = colors[i]
			})

			// Kill old sigma if needed
			var oldSigmaInstance = provider.get('sigmaInstance')
			if(oldSigmaInstance !== undefined){
				_self.dispatchEvent('update_layoutRunning', {
					layoutRunning: !provider.get('layoutRunning')
				})
				oldSigmaInstance.emptyGraph() // .kill() is not currently implemented
				container.find('#sigma-example').html('')
			}

			// Instanciate sigma.js and customize it
			var sigmaInstance = sigma.init(document.getElementById('sigma-example')).drawingProperties({
				defaultLabelColor: '#666'
				,edgeColor: 'default'
				,defaultEdgeColor: '#ccc'
				,defaultNodeColor: '#999'
			})

			// Populate
			json.nodes.forEach(function(node){
				sigmaInstance.addNode(node.id,{
					'x': Math.random()
					,'y': Math.random()
					,label: node.label
					,size: 1 + Math.log(1 + 0.1 * ( node.inEdges.length + node.outEdges.length ) )
					,'color': colorsByType[node.attributes_byId['attr_type']]
				})
			})
			json.edges.forEach(function(link, i){
				sigmaInstance.addEdge(i,link.sourceID,link.targetID)
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
				sigmaInstance.startForceAtlas2()
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
	function parse_csv(csv){
		var table = build_DoiLinks(csv, d3.csv.parseRows, 'References', 'Cited papers having a DOI')

    // We extract and clean references
    var referencesHash = cleanReferences(table)

    console.log(table)

    return table
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
      refIndex[trivialKey] = {0:{key:key, components: components}}
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
        return key

      } else {

        // No match: we just add...
        key = trivialKey + '-' + id
        refIndex[trivialKey][id] = {key:key, components: components}
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

    return '' + components.date + '-' + authorsShort.join('-')
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

})(jQuery, domino)


