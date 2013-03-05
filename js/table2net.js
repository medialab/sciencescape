;(function($, ns, undefined){


    ns.buildGraph = function(table, settings){
        
        // Settings
        ns.settings = settings || {}
        ns.table = table

        if(ns.settings.jsonCallback === undefined && ns.settings.gexfCallback === undefined){
            console.log('Table2net: at least one callback required (jsonCallback or gexfCallback)')
            return false
        }

        if(ns.settings.mode === undefined)
            ns.settings.mode = 'normal'    // 'normal', 'bipartite', 'citations', 'nolink'
        
        if(ns.settings.weightEdges === undefined)
            ns.weightEdges = false
        
        if( ( ns.settings.mode == 'normal' || ns.settings.mode == 'citation' || ns.settings.mode == 'nolink' ) && ns.settings.nodesColumnId === undefined)
            console.log('Table2net: nodesColumnId required for mode '+ns.settings.mode)
        
        if(ns.settings.nodesSeparator === undefined)
            ns.settings.nodesSeparator = null
        
        if(ns.settings.mode == 'normal'  && ns.settings.linksColumnId === undefined)
            console.log('Table2net: linksColumnId required for mode '+ns.settings.mode)
        
        if(ns.settings.linksSeparator === undefined)
            ns.settings.linksSeparator = null

        if(ns.settings.mode == 'bipartite' && ns.settings.nodesColumnId1 === undefined)
            console.log('Table2net: nodesColumnId1 required for mode '+ns.settings.mode)
        
        if(ns.settings.nodesSeparator1 === undefined)
            ns.settings.nodesSeparator1 = null
        
        if(ns.settings.mode == 'bipartite' && ns.settings.nodesColumnId2 === undefined)
            console.log('Table2net: nodesColumnId2 required for mode '+ns.settings.mode)
        
        if(ns.settings.nodesSeparator2 === undefined)
            ns.settings.nodesSeparator2 = null

        if(ns.settings.mode == 'citation' && ns.settings.citationLinksColumnId === undefined)
            console.log('Table2net: citationLinksColumnId required for mode '+ns.settings.mode)
        
        if(ns.settings.citationLinksSeparator === undefined)
            ns.settings.citationLinksSeparator = null
        
        if(ns.settings.nodesMetadataColumnIds === undefined)
            ns.settings.nodesMetadataColumnIds = []

        if(ns.settings.nodesMetadataColumnIds1 === undefined)
            ns.settings.nodesMetadataColumnIds1 = []

        if(ns.settings.nodesMetadataColumnIds2 === undefined)
            ns.settings.nodesMetadataColumnIds2 = []

        if(ns.settings.linksMetadataColumnIds === undefined)
            ns.settings.linksMetadataColumnIds = []
        
        if(ns.settings.citationLinksMetadataColumnIds === undefined)
            ns.settings.citationLinksMetadataColumnIds = []

        if(ns.settings.timeSeries === undefined)
            ns.settings.timeSeries = false

        if(ns.settings.timeSeries && ns.settings.timeSeriesColumnId === undefined)
            console.log('Table2net: timeSeriesColumnId required timeSeries enabled')
        


        // Run
        if(ns.settings.progressInit !== undefined)
            ns.settings.progressInit()
        setTimeout(ns.buildGraph_, 10)
    }

    ns.buildGraph_ = function(){
        var tableHeader = ns.table.shift()
        

        if(ns.settings.mode == 'normal'){

            ns.nodes = ns.getNodes(ns.settings.nodesColumnId, ns.settings.nodesSeparator != null, ns.settings.nodesSeparator)
            ns.links = ns.getMonopartiteLinks(ns.settings.nodesColumnId, ns.settings.nodesSeparator != null, ns.settings.nodesSeparator, ns.settings.linksColumnId, ns.settings.linksSeparator != null, ns.settings.linksSeparator)

        } else if(ns.settings.mode == 'bipartite'){

            var nodes1 = ns.getNodes(ns.settings.nodesColumnId1, ns.settings.nodesSeparator1 != null, ns.settings.nodesSeparator1)
                ,nodes2 = ns.getNodes(ns.settings.nodesColumnId2, ns.settings.nodesSeparator2 != null, ns.settings.nodesSeparator2)
            ns.nodes = nodes1.concat(nodes2)
            ns.links = ns.getBipartiteLinks(ns.settings.nodesColumnId1, ns.settings.nodesSeparator1 != null, ns.settings.nodesSeparator1, ns.settings.nodesColumnId2, ns.settings.nodesSeparator2 != null, ns.settings.nodesSeparator2)

        } else if(ns.settings.mode == 'citation'){

            ns.nodes = ns.getNodes(ns.settings.nodesColumnId, ns.settings.nodesSeparator != null, ns.settings.nodesSeparator)
            ns.links = ns.getCitationLinks(ns.settings.nodesColumnId, ns.settings.nodesSeparator != null, ns.settings.nodesSeparator, ns.settings.citationLinksColumnId, ns.settings.citationLinksSeparator != null, ns.settings.citationLinksSeparator)
            
        } else if(ns.settings.mode == 'nolink'){
            
            ns.nodes = ns.getNodes(ns.settings.nodesColumnId, ns.settings.nodesSeparator != null, ns.settings.nodesSeparator)
            ns.links = [];
            
        }

        if(ns.settings.jsonCallback !== undefined){
            var nodesAttributes = [
                    {
                        id: 'attr_type'
                        ,title: 'Type'
                        ,type: 'string'
                    },{
                        id: 'global_occurrences'
                        ,title: 'Occurrences Count'
                        ,type: 'integer'
                    }
                ].concat(
                    (ns.settings.mode == 'bipartite')?(
                        ns.settings.nodesMetadataColumnIds1.map(function(colId){
                            return {
                                id: 'attr_1_' + colId
                                ,title: tableHeader[colId]
                                ,type: 'string'
                            }
                        }).concat(ns.settings.nodesMetadataColumnIds2.map(function(colId){
                            return {
                                id: 'attr_2_' + colId
                                ,title: tableHeader[colId]
                                ,type: 'string'
                            }
                        }))
                    ):(
                        ns.settings.nodesMetadataColumnIds.map(function(colId){
                            return {
                                id: 'attr_'+colId
                                ,title: tableHeader[colId]
                                ,type: 'string'
                            }
                        })
                    )
                )

            var edgesAttributes = [
                    {
                        id: 'attr_type'
                        ,title: 'Type'
                        ,type: 'string'
                    },{
                        id: 'matchings_count'
                        ,title: 'Matchings Count'
                        ,type: 'integer'
                    }
                ].concat(ns.settings.linksMetadataColumnIds.map(function(colId){
                    return {
                        id: 'attr_'+colId
                        ,title: tableHeader[colId]
                        ,type: 'string'
                    }
                }))

            var nodesId = []
            var nodes = ns.nodes.map(function(d){
                    var id = ns.dehydrate_expression(tableHeader[d.colId])+"_"+$.md5(d.node)
                        ,label = d.node
                        ,type = tableHeader[d.colId]
                        ,attributes = [
                                {  attr: 'attr_type',           val: type }
                                ,{ attr: 'global_occurrences',  val: d.tableRows.length }
                            ].concat(
                                (ns.settings.mode == 'bipartite')?(
                                    ns.settings.nodesMetadataColumnIds1.map(function(colId){
                                        if(type == tableHeader[ns.settings.nodesColumnId1]){
                                            var currentAttValue = ""
                                                ,attValues = d.tableRows.map(function(rowId){
                                                    return table[rowId][colId]
                                                }).sort(function(a, b) {
                                                    return a < b ? -1 : a > b ? 1 : 0
                                                }).filter(function(attValue){
                                                    var result = (attValue != currentAttValue)
                                                    currentAttValue = attValue
                                                    return result
                                                }).join(" | ")
                                            return {attr: 'attr_1_'+colId, val: attValues}
                                        } else {
                                            return {attr: 'attr_1_'+colId, val: 'n/a'}
                                        }
                                    }).concat(ns.settings.nodesMetadataColumnIds2.map(function(colId){
                                        if(type == tableHeader[ns.settings.nodesColumnId2]){
                                            var currentAttValue = ""
                                                ,attValues = d.tableRows.map(function(rowId){
                                                    return table[rowId][colId]
                                                }).sort(function(a, b) {
                                                    return a < b ? -1 : a > b ? 1 : 0
                                                }).filter(function(attValue){
                                                    var result = (attValue != currentAttValue)
                                                    currentAttValue = attValue
                                                    return result
                                                }).join(" | ")
                                            return {attr: 'attr_2_'+colId, val: attValues}
                                        } else {
                                            return {attr: 'attr_2_'+colId, val: 'n/a'}
                                        }
                                    }))
                                ):(
                                    ns.settings.nodesMetadataColumnIds.map(function(colId){
                                        var currentAttValue = ""
                                            ,attValues = d.tableRows.map(function(rowId){
                                                return ns.table[rowId][colId]
                                            }).sort(function(a, b) {
                                                return a < b ? -1 : a > b ? 1 : 0
                                            }).filter(function(attValue){
                                                var result = (attValue != currentAttValue)
                                                currentAttValue = attValue
                                                return result
                                            }).join(" | ")
                                        return {attr: 'attr_'+colId, val: attValues}
                                    })
                                )
                            )
                    nodesId.push(id)
                    return {id:id, label:label, attributes:attributes}
                })
            
            var edges = ns.links.map(function(d){
                    var sourceId = ns.dehydrate_expression(tableHeader[d.sourceColId])+"_"+$.md5(d.source)
                        ,targetId = ns.dehydrate_expression(tableHeader[d.targetColId])+"_"+$.md5(d.target)
                        ,attributes = [
                            {  attr: 'attr_type',       val: tableHeader[ns.settings.linksColumnId] }
                            ,{ attr: 'matchings_count', val: d.tableRows.length }
                        ].concat(ns.settings.linksMetadataColumnIds.map(function(colId){
                            var currentAttValue = ""
                                ,attValues = d.tableRows.map(function(rowId){
                                    return ns.table[rowId][colId]
                                }).sort(function(a, b) {
                                    return a < b ? -1 : a > b ? 1 : 0
                                }).filter(function(attValue){
                                    var result = (attValue != currentAttValue)
                                    currentAttValue = attValue
                                    return result
                                }).join(" | ")
                            return {attr: 'attr_'+colId, val:attValues}
                        }))

                    return {sourceID: sourceId, targetID: targetId, attributes: attributes}
                })
            
            // In JSON we ensure that the nodes connecting edges actually exist (citation mode)
            if(ns.settings.mode == 'citation'){
                edges = edges.filter(function(edge){
                    
                    return nodesId.some(function(id){
                        return edge.sourceID == id
                    }) && nodesId.some(function(id){
                        return edge.targetID == id
                    })
                })
            }

            ns.settings.jsonCallback({
                attributes: {
                    source: 'table2net'
                }
                ,nodesAttributes: nodesAttributes
                ,edgesAttributes: edgesAttributes
                ,nodes: nodes
                ,edges: edges
            })
        }
        
        if(ns.settings.gexfCallback !== undefined){

              /////////////////////////
             // Let's make the GEXF //
            /////////////////////////
            
            var content = []
            
            content.push('<?xml version="1.0" encoding="UTF-8"?><gexf xmlns="http://www.gexf.net/1.1draft" version="1.1" xmlns:viz="http://www.gexf.net/1.1draft/viz" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.gexf.net/1.1draft http://www.gexf.net/1.1draft/gexf.xsd">')
            content.push("\n" +  '<meta lastmodifieddate="2011-06-15"><creator>Table2Net</creator><description>Jacomy Mathieu, Sciences Po Medialab and WebAtlas</description></meta>')
            content.push("\n" +  '<graph defaultedgetype="'+((ns.settings.mode=="citation")?('directed'):('undirected'))+'" '+((ns.settings.timeSeries)?('timeformat="double"'):(''))+' mode="'+((ns.settings.timeSeries)?('dynamic'):('static'))+'">')
            
            // Nodes Attributes
            content.push("\n" +  '<attributes class="node" mode="'+((ns.settings.timeSeries)?('dynamic'):('static'))+'">')
            content.push("\n" +  '<attribute id="attr_type" title="Type" type="string"></attribute>')
            content.push("\n" +  '<attribute id="global_occurrences" title="Occurrences Count" type="integer"></attribute>')
            if(ns.settings.mode == 'bipartite'){
                ns.settings.nodesMetadataColumnIds1.forEach(function(colId){
                    content.push("\n" +  '<attribute id="attr_1_'+colId+'" title="'+ns.xmlEntities(tableHeader[colId])+' (type 1)" type="string"></attribute>')
                })
                ns.settings.nodesMetadataColumnIds2.forEach(function(colId){
                    content.push("\n" +  '<attribute id="attr_2_'+colId+'" title="'+ns.xmlEntities(tableHeader[colId])+' (type 2)" type="string"></attribute>')
                })
            } else {
                ns.settings.nodesMetadataColumnIds.forEach(function(colId){
                    content.push("\n" +  '<attribute id="attr_'+colId+'" title="'+ns.xmlEntities(tableHeader[colId])+'" type="string"></attribute>')
                })
            }
            content.push("\n" +  '</attributes>')
            
            // Edges Attributes
            content.push("\n" +  '<attributes class="edge" mode="'+((ns.settings.timeSeries)?('dynamic'):('static'))+'">')
            content.push("\n" +  '<attribute id="attr_type" title="Type" type="string"></attribute>')
            content.push("\n" +  '<attribute id="matchings_count" title="Matchings Count" type="integer"></attribute>')
            ns.settings.linksMetadataColumnIds.forEach(function(colId){
                content.push("\n" +  '<attribute id="attr_'+colId+'" title="'+ns.xmlEntities(tableHeader[colId])+'" type="string"></attribute>')
            })
            content.push("\n" +  '</attributes>')
            
            // Nodes
            content.push("\n" +  '<nodes>')
            ns.nodes.forEach(function(d){
                var id = ns.dehydrate_expression(tableHeader[d.colId])+"_"+$.md5(d.node)
                    ,label = d.node
                    ,type = tableHeader[d.colId]
                
                content.push("\n" +  '<node id="'+id+'" label="'+ns.xmlEntities(label)+'">')
                
                // Dynamic
                if(ns.settings.timeSeries){
                    content.push("\n" +  '<spells>')
                    var years = []
                    d.tableRows.forEach(function(rowId){
                        var year = ns.table[rowId][ns.settings.timeSeriesColumnId]
                        if(!years.some(function(y){return y == year})){
                            years.push(year);
                        }
                    });
                    years.forEach(function(y){
                        y = parseInt(y)
                        content.push("\n" +  '<spell start="'+y+'.0" end="'+(y+1)+'.0" />')
                    })
                    content.push("\n" +  '</spells>')
                }
                
                // AttributeValues
                content.push("\n" +  '<attvalues>')
                content.push("\n" +  '<attvalue for="attr_type" value="'+ns.xmlEntities(type)+'"></attvalue>')
                content.push("\n" +  '<attvalue for="global_occurrences" value="'+d.tableRows.length+'"></attvalue>')
                
                if(ns.settings.mode == 'bipartite'){
                    ns.settings.nodesMetadataColumnIds1.forEach(function(colId){
                        if(!ns.settings.timeSeries){
                            if(type == tableHeader[ns.settings.nodesColumnId1]){
                                var currentAttValue = ""
                                    ,attValues = d.tableRows.map(function(rowId){
                                        return ns.table[rowId][colId]
                                    }).sort(function(a, b) {
                                        return a < b ? -1 : a > b ? 1 : 0
                                    }).filter(function(attValue){
                                        var result = (attValue != currentAttValue)
                                        currentAttValue = attValue
                                        return result
                                    }).join(" | ")
                                
                                content.push("\n" +  '<attvalue for="attr_1_'+colId+'" value="'+ns.xmlEntities(attValues)+'"></attvalue>');
                            } else {
                                content.push("\n" +  '<attvalue for="attr_1_'+colId+'" value="n/a"></attvalue>');
                            }
                        } else {
                            var attValuesPerYear = []
                            d.tableRows.forEach(function(rowId){
                                var year = ns.table[rowId][ns.settings.timeSeriesColumnId]
                                    ,attValuesThisYear = attValuesPerYear[year] || []
                                    ,attValue = ns.table[rowId][colId]
                                attValuesThisYear.push(attValue)
                                attValuesPerYear[year] = attValuesThisYear
                            })
                            d3.keys(attValuesPerYear).forEach(function(year){
                                var currentAttValue = ""
                                    ,attValues = attValuesPerYear[year].sort(function(a, b) {
                                        return a < b ? -1 : a > b ? 1 : 0
                                    }).filter(function(attValue){
                                        var result = (attValue != currentAttValue)
                                        currentAttValue = attValue
                                        return result
                                    }).join(" | ")
                                year = parseInt(year)
                                if(type == tableHeader[ns.settings.nodesColumnId1]){
                                    content.push("\n" +  '<attvalue for="attr_1_'+colId+'" value="'+ns.xmlEntities(attValues)+'" start="'+year+'.0" end="'+(year+1)+'.0"></attvalue>')
                                } else {
                                    content.push("\n" +  '<attvalue for="attr_1_'+colId+'" value="n/a" start="'+year+'.0" end="'+(year+1)+'.0"></attvalue>')
                                }
                            })
                        }
                    })
                    ns.settings.nodesMetadataColumnIds2.forEach(function(colId){
                        if(!ns.settings.timeSeries){
                            if(type == tableHeader[ns.settings.nodesColumnId2]){
                                var currentAttValue = ""
                                    ,attValues = d.tableRows.map(function(rowId){
                                        return ns.table[rowId][colId]
                                    }).sort(function(a, b) {
                                        return a < b ? -1 : a > b ? 1 : 0
                                    }).filter(function(attValue){
                                        var result = (attValue != currentAttValue)
                                        currentAttValue = attValue
                                        return result
                                    }).join(" | ")
                                
                                content.push("\n" +  '<attvalue for="attr_2_'+colId+'" value="'+ns.xmlEntities(attValues)+'"></attvalue>');
                            } else {
                                content.push("\n" +  '<attvalue for="attr_2_'+colId+'" value="n/a"></attvalue>');
                            }
                        } else {
                            var attValuesPerYear = []
                            d.tableRows.forEach(function(rowId){
                                var year = ns.table[rowId][ns.settings.timeSeriesColumnId]
                                    ,attValuesThisYear = attValuesPerYear[year] || []
                                    ,attValue = ns.table[rowId][colId]
                                attValuesThisYear.push(attValue)
                                attValuesPerYear[year] = attValuesThisYear
                            })
                            d3.keys(attValuesPerYear).forEach(function(year){
                                var currentAttValue = ""
                                    ,attValues = attValuesPerYear[year].sort(function(a, b) {
                                        return a < b ? -1 : a > b ? 1 : 0
                                    }).filter(function(attValue){
                                        var result = (attValue != currentAttValue)
                                        currentAttValue = attValue
                                        return result
                                    }).join(" | ")
                                year = parseInt(year)
                                if(type == tableHeader[ns.settings.nodesColumnId2]){
                                    content.push("\n" +  '<attvalue for="attr_2_'+colId+'" value="'+ns.xmlEntities(attValues)+'" start="'+year+'.0" end="'+(year+1)+'.0"></attvalue>')
                                } else {
                                    content.push("\n" +  '<attvalue for="attr_2_'+colId+'" value="n/a" start="'+year+'.0" end="'+(year+1)+'.0"></attvalue>')
                                }
                            })
                        }
                    })
                } else {
                    ns.settings.nodesMetadataColumnIds.forEach(function(colId){
                        if(!ns.settings.timeSeries){
                            var currentAttValue = ""
                                ,attValues = d.tableRows.map(function(rowId){
                                    return ns.table[rowId][colId];
                                }).sort(function(a, b) {
                                    return a < b ? -1 : a > b ? 1 : 0
                                }).filter(function(attValue){
                                    var result = (attValue != currentAttValue)
                                    currentAttValue = attValue
                                    return result
                                }).join(" | ")
                            
                            content.push("\n" +  '<attvalue for="attr_'+colId+'" value="'+ns.xmlEntities(attValues)+'"></attvalue>')
                        } else {
                            attValuesPerYear = []
                            d.tableRows.forEach(function(rowId){
                                var year = ns.table[rowId][dynColumnId]
                                    ,attValuesThisYear = attValuesPerYear[year] || []
                                    ,attValue = ns.table[rowId][colId]
                                attValuesThisYear.push(attValue)
                                
                                attValuesPerYear[year] = attValuesThisYear
                            })
                            d3.keys(attValuesPerYear).forEach(function(year){
                                var currentAttValue = ""
                                    ,attValues = attValuesPerYear[year].sort(function(a, b) {
                                        return a < b ? -1 : a > b ? 1 : 0
                                    }).filter(function(attValue){
                                        var result = (attValue != currentAttValue)
                                        currentAttValue = attValue
                                        return result
                                    }).join(" | ")
                                year = parseInt(year)
                                content.push("\n" +  '<attvalue for="attr_'+colId+'" value="'+ns.xmlEntities(attValues)+'" start="'+year+'.0" end="'+(year+1)+'.0"></attvalue>')
                            });
                        }
                    })
                }   
                
                content.push("\n" +  '</attvalues>')
                content.push("\n" +  '</node>')
                
            })
            content.push("\n" +  '</nodes>')
            
            // Edges
            content.push("\n" +  '<edges>')
            ns.links.forEach(function(d){
                var sourceId = ns.dehydrate_expression(tableHeader[d.sourceColId])+"_"+$.md5(d.source)
                    ,targetId = ns.dehydrate_expression(tableHeader[d.targetColId])+"_"+$.md5(d.target)
                    ,type = tableHeader[ns.settings.linksColumnId]
                
                content.push("\n" +  '<edge source="'+sourceId+'" target="'+targetId+'" '+((ns.settings.weightEdges)?('weight="'+d.tableRows.length+'"'):(''))+'>')
                
                // Dynamic
                if(ns.settings.timeSeries){
                    content.push("\n" +  '<spells>');
                    var years = []
                    d.tableRows.forEach(function(rowId){
                        var year = ns.table[rowId][dynColumnId]
                        if(!years.some(function(y){return y == year})){
                            years.push(year)
                        }
                    });
                    years.forEach(function(y){
                        y = parseInt(y)
                        content.push("\n" +  '<spell start="'+y+'.0" end="'+(y+1)+'.0" />');
                    });
                    content.push("\n" +  '</spells>');
                }
                
                // AttributeValues
                content.push("\n" +  '<attvalues>')
                content.push("\n" +  '<attvalue for="matchings_count" value="'+ns.xmlEntities(d.tableRows.length)+'"></attvalue>');
                content.push("\n" +  '<attvalue for="attr_type" value="'+ns.xmlEntities(type)+'"></attvalue>');
                
                ns.settings.linksMetadataColumnIds.forEach(function(colId){
                    if(!ns.settings.timeSeries){
                        var currentAttValue = ""
                            ,attValues = d.tableRows.map(function(rowId){
                                return ns.table[rowId][colId]
                            }).sort(function(a, b) {
                                return a < b ? -1 : a > b ? 1 : 0
                            }).filter(function(attValue){
                                var result = (attValue != currentAttValue)
                                currentAttValue = attValue
                                return result
                            }).join(" | ")
                        
                        content.push("\n" +  '<attvalue for="attr_'+colId+'" value="'+ns.xmlEntities(attValues)+'"></attvalue>')
                    } else {
                        attValuesPerYear = []
                        d.tableRows.forEach(function(rowId){
                            var year = ns.table[rowId][dynColumnId]
                                ,attValuesThisYear = attValuesPerYear[year] || []
                                ,attValue = ns.table[rowId][colId]
                            attValuesThisYear.push(attValue)
                            
                            attValuesPerYear[year] = attValuesThisYear
                        })
                        d3.keys(attValuesPerYear).forEach(function(year){
                            var currentAttValue = ""
                                ,attValues = attValuesPerYear[year].sort(function(a, b) {
                                    return a < b ? -1 : a > b ? 1 : 0
                                }).filter(function(attValue){
                                    var result = (attValue != currentAttValue)
                                    currentAttValue = attValue
                                    return result
                                }).join(" | ")
                            year = parseInt(year)
                            content.push("\n" +  '<attvalue for="attr_'+colId+'" value="'+ns.xmlEntities(attValues)+'" start="'+year+'.0" end="'+(year+1)+'.0"></attvalue>')
                        })
                    }
                })
                content.push("\n" +  '</attvalues>')
                content.push("\n" +  '</edge>')
            })
            content.push("\n" +  '</edges>')

            content.push("\n" +  '</graph></gexf>')
            
            // Finally, download !
            /*
            ns.nodes = []
            ns.links = []
            
            var blob = new Blob(content, {'type':'text/gexf+xml;charset=utf-8'})
                ,filename = "Network.gexf"
            if(navigator.userAgent.match(/firefox/i))
               alert('Note:\nFirefox does not handle file names, so you will have to rename this file to\n\"'+filename+'\""\nor some equivalent.')
            saveAs(blob, filename)

            $('#build_container').html('<div class="alert alert-success">GEXF downloaded <button type="button" class="close" data-dismiss="alert">&times;</button></div>')
            */
            ns.settings.gexfCallback(content)

        }
    }



    // Model
    ns.getNodes = function(nodesColumnId, nodesMultiples, nodesSeparator){
        // NODES
        var nodesList = ns.table.map(function(d,i){return {node:d[nodesColumnId], colId:nodesColumnId, tableRows:[i]};});
        
        // Unfold if there are multiples
        if(nodesMultiples){
            nodesList = d3.merge(
                nodesList.map(function(d){
                    if(d.node){
                        return d.node.split(nodesSeparator)
                            .map(function(dd){
                                // NB: array.slice(0) is just cloning the array. This is necessary here.
                                return {node:dd, colId:d.colId, tableRows:d.tableRows.slice(0)};
                            });
                    } else {
                        return [];
                    }
                })
            );
        }
        
        // Clean
        var temp_nodesList = nodesList
            .map(function(d){
                return {node:ns.clean_expression(d.node), colId:d.colId, tableRows:d.tableRows};
            })
            .filter(function(d){
                return d.node != "";
            })
            .sort(function(a, b) {
                return a.node < b.node ? -1 : a.node > b.node ? 1 : 0;
            });
        
        // Merge Doubles
        nodesList = [];
        for (var i = 0; i < temp_nodesList.length; i++) {
            if (i==0 || temp_nodesList[i - 1].node != temp_nodesList[i].node) {
                nodesList.push(temp_nodesList[i]);
            } else {
                nodesList[nodesList.length-1].tableRows = nodesList[nodesList.length-1].tableRows.concat(temp_nodesList[i].tableRows);
            }
        }
        
        return nodesList;
    }

    ns.getMonopartiteLinks = function(nodesColumnId, nodesMultiples, nodesSeparator, linksColumnId, linksMultiples, linksSeparator){
        // To build our graph, we will first build a bipartite graph and the transform it to a monopartite graph.
        // In this case, the nodes of the bipartite graph that will be transformed in links are called "GhostNodes".
        
        var ghostNodesList = ns.table.map(function(d,i){
            // Here we want to keep tracking the links.
            // So we return objects that contain the ghostNode and the list of linked nodes.
            // There is only one linked node if there are no multiples for nodes, of course...
            
            // Linked nodes
            var linkedNodesList;
            if(!nodesMultiples){
                linkedNodesList = [ns.clean_expression(ns.table[i][nodesColumnId])];
            } else {
                // We clean the linkedNodesList like we did with the nodesList before...
                if(ns.table[i][nodesColumnId]){
                    linkedNodesList = ns.table[i][nodesColumnId].split(nodesSeparator).map(function(d){
                        return ns.clean_expression(d);
                    })
                    .filter(function(d){
                        return d != "";
                    });
                } else {
                    linkedNodesList = [];
                }
            }
            return {ghostNode:d[linksColumnId], linkedNodes:linkedNodesList, tableRows:[i]};
        });
        
        // Unfold if there are multiples
        if(linksMultiples){
            ghostNodesList = d3.merge(
                ghostNodesList.map(function(d,i){
                    subGhostNodes = d.ghostNode.split(linksSeparator);
                    return subGhostNodes.map(function(dd){
                        // NB: array.slice(0) is just cloning the array. This is necessary here.
                        return {ghostNode:dd, linkedNodes:d.linkedNodes.slice(0), tableRows:d.tableRows.slice(0)};
                    });
                })
            );
        }

        // Clean
        var temp_ghostNodesList = ghostNodesList
            .map(function(d){
                return {ghostNode:ns.clean_expression(d.ghostNode), linkedNodes:d.linkedNodes, tableRows:d.tableRows};
            })
            .filter(function(d){
                return d.ghostNode != "";
            })
            .sort(function(a, b) {
                return a.ghostNode < b.ghostNode ? -1 : a.ghostNode > b.ghostNode ? 1 : 0;
            });
        
        // Merge Doubles
        ghostNodesList = [];
        for(var i=0; i<temp_ghostNodesList.length; i++) {
            if(i==0 || temp_ghostNodesList[i-1].ghostNode != temp_ghostNodesList[i].ghostNode) {
                // The element is different from the previous one. We just add it, ok...
                ghostNodesList.push(temp_ghostNodesList[i]);
            } else {
                // The element is the same. Then we have to merge: add the new linked nodes.
                currentLinkedNodesList = ghostNodesList[ghostNodesList.length-1].linkedNodes;
                
                temp_ghostNodesList[i].linkedNodes.forEach(function(d){
                    if(!currentLinkedNodesList.some(function(dd){
                        return dd == d;
                    })){
                        // If currentLinkedNodesList contains no "d" node
                        // That is, if the element "d" is new, just add it.
                        currentLinkedNodesList.push(d);
                    }
                });
                
                ghostNodesList[ghostNodesList.length-1].linkedNodes = currentLinkedNodesList;
            }
        }
        
        // Now we have to build the actual monopartite links.
        // Each ghostNode links all the nodes linked to it. First we add all these links and then we remove doublons.
        links = d3.merge(
            ghostNodesList.map(function(d){
                var localLinks = [];
                d.linkedNodes.forEach(function(dd,i){
                    for(j=0; j<i; j++){
                        var node1 = d.linkedNodes[i];
                        var node2 = d.linkedNodes[j];
                        if(node1 < node2){
                            localLinks.push({source:node1, target:node2, sourceColId:nodesColumnId, targetColId:nodesColumnId, tableRows:d.tableRows});
                        } else {
                            localLinks.push({source:node2, target:node1, sourceColId:nodesColumnId, targetColId:nodesColumnId, tableRows:d.tableRows});
                        }
                    }
                });
                return localLinks;
            })
        );
        
        // Remove doublons
        temp_links = links.sort(function(a, b) {
            return a.source+a.target < b.source+b.target ? -1 : a.source+a.target > b.source+b.target ? 1 : 0;
        });
        links = [];
        for(var i=0; i<temp_links.length; i++) {
            if(i==0 || temp_links[i-1].source != temp_links[i].source || temp_links[i-1].target != temp_links[i].target) {
                // The element is different from the previous one. We just add it.
                links.push(temp_links[i]);
            } else {
                links[links.length-1].tableRows = links[links.length-1].tableRows.concat(temp_links[i].tableRows);
            }
        }
        return links;
    }

    ns.getBipartiteLinks = function(nodesColumnId_1, nodesMultiples_1, nodesSeparator_1, nodesColumnId_2, nodesMultiples_2, nodesSeparator_2){
        var secondaryNodesList = ns.table.map(function(d,i){
            // Here we want to keep tracking the links.
            // So we return objects that contain the secondaryNode and the list of linked nodes.
            // There is only one linked nodes if there are no multiples for nodes, of course...

            // Linked nodes
            var linkedNodesList;
            if(!nodesMultiples_1){
                var linkedNode = ns.clean_expression(ns.table[i][nodesColumnId_1]);
                linkedNodesList = [linkedNode];
            } else {
                // We clean the linkedNodesList like we did with the nodesList before...
                linkedNodesList = ns.table[i][nodesColumnId_1].split(nodesSeparator_1).map(function(d){
                    return ns.clean_expression(d);
                })
                .filter(function(d){
                    return d != "";
                });
            }
            secondaryNode = d[nodesColumnId_2] || "";
            return {secondaryNode:secondaryNode, linkedNodes:linkedNodesList, tableRows:[i]};
        });
        
        // Unfold if there are multiples
        if(nodesMultiples_2){
            secondaryNodesList = d3.merge(
                secondaryNodesList.map(function(d,i){
                    subsecondaryNodes = d.secondaryNode.split(nodesSeparator_2);
                    return subsecondaryNodes.map(function(dd){
                        // NB: array.slice(0) is just cloning the array. This is necessary here.
                        return {secondaryNode:dd, linkedNodes:d.linkedNodes.slice(0), tableRows:d.tableRows.slice(0)};
                    });
                })
            );
        }
        
        // Clean
        var temp_secondaryNodesList = secondaryNodesList
            .map(function(d){
                return {secondaryNode:ns.clean_expression(d.secondaryNode), linkedNodes:d.linkedNodes, tableRows:d.tableRows};
            })
            .filter(function(d){
                return d.secondaryNode != "";
            })
            .sort(function(a, b) {
                return a.secondaryNode < b.secondaryNode ? -1 : a.secondaryNode > b.secondaryNode ? 1 : 0;
            });
        
        // Merge Doubles
        secondaryNodesList = [];
        for(var i=0; i<temp_secondaryNodesList.length; i++){
            if(i==0 || temp_secondaryNodesList[i-1].secondaryNode != temp_secondaryNodesList[i].secondaryNode) {
                // The element is different from the previous one. We just add it, ok...
                secondaryNodesList.push(temp_secondaryNodesList[i]);
            } else {
                // The element is the same. Then we have to merge: add the new linked nodes.
                var currentLinkedNodesList = secondaryNodesList[secondaryNodesList.length-1].linkedNodes;
                var currentTableRows = secondaryNodesList[secondaryNodesList.length-1].tableRows;
                
                temp_secondaryNodesList[i].linkedNodes.forEach(function(candidate_linked_node){
                    if(currentLinkedNodesList.every(function(linked_node){
                        return linked_node != candidate_linked_node;
                    })){
                        // If currentLinkedNodesList contains no candidate_linked_node
                        // That is, if the candidate_linked_node is new, just add it.
                        currentLinkedNodesList.push(candidate_linked_node);
                    }
                });
                
                temp_secondaryNodesList[i].tableRows.forEach(function(candidate_table_row){
                    if(currentTableRows.every(function(table_row){
                        return table_row != candidate_table_row;
                    })){
                        // If currentTableRows contains no candidate_table_row
                        // That is, if the candidate_table_row is new, just add it.
                        currentTableRows.push(candidate_table_row);
                    }
                });
            }
        }
        
        // console.log(secondaryNodesList.filter(function(d,i){return i<10;}));
        
        // Now we can build the bipartite graph of nodes and secondaryNodes linked.
        var links = d3.merge(secondaryNodesList.map(function(d){
            return d.linkedNodes.map(function(dd){
                return {source:dd, target:d.secondaryNode, sourceColId:nodesColumnId_1, targetColId:nodesColumnId_2, tableRows:d.tableRows};
            });
        }));
        
        // Remove doublons
        temp_links = links.sort(function(a, b) {
            return a.source+a.target < b.source+b.target ? -1 : a.source+a.target > b.source+b.target ? 1 : 0;
        });
        links = [];
        for(var i=0; i<temp_links.length; i++) {
            if(i==0 || temp_links[i-1].source != temp_links[i].source || temp_links[i-1].target != temp_links[i].target) {
                // The element is different from the previous one. We just add it.
                links.push(temp_links[i]);
            } else {
                links[links.length-1].tableRows = links[links.length-1].tableRows.concat(temp_links[i].tableRows);
            }
        }
        
        return links;
    }

    ns.getCitationLinks = function(nodesColumnId, nodesMultiples, nodesSeparator, linksColumnId, linksMultiples, linksSeparator){
        // localLinks.push({source:node1, target:node2, sourceColId:nodesColumnId, targetColId:nodesColumnId, tableRows:d.tableRows});

        var linksList = ns.table.map(function(d,i){return {source:d[nodesColumnId], sourceColId:nodesColumnId, target:d[linksColumnId], targetColId:nodesColumnId, tableRows:[i]};});
        
        // Unfold by Source if there are multiples
        if(nodesMultiples){
            linksList = d3.merge(
                linksList.map(function(link){
                    if(link.source){
                        return link.source.split(nodesSeparator)
                            .map(function(slicedSource){
                                // NB: array.slice(0) is just cloning the array. This is necessary here.
                                return {source:slicedSource, sourceColId:link.sourceColId, target:link.target, targetColId:link.targetColId, tableRows:link.tableRows.slice(0)};
                            });
                    } else {
                        return [];
                    }
                })
            );
        }
        
        // Unfold by Target if there are multiples
        if(linksMultiples){
            linksList = d3.merge(
                linksList.map(function(link){
                    if(link.source){
                        return link.target.split(linksSeparator)
                            .map(function(slicedTarget){
                                // NB: array.slice(0) is just cloning the array. This is necessary here.
                                return {source:link.source, sourceColId:link.sourceColId, target:slicedTarget, targetColId:link.targetColId, tableRows:link.tableRows.slice(0)};
                            });
                    } else {
                        return [];
                    }
                })
            );
        }
        
        // Clean
        var temp_linksList = linksList
            .map(function(link){
                return {source:ns.clean_expression(link.source), sourceColId:link.sourceColId, target:ns.clean_expression(link.target), targetColId:link.targetColId, tableRows:link.tableRows};
            })
            .filter(function(link){
                return link.source != "" && link.target != "";
            })
            .sort(function(a, b) {
                var A = a.source+"  "+a.target;
                var B = b.source+"  "+b.target;
                return A < B ? -1 : A > B ? 1 : 0;
            });
        
        // Merge Doubles
        linksList = [];
        for (var i = 0; i < temp_linksList.length; i++) {
            if (i==0 || temp_linksList[i - 1].source != temp_linksList[i].source || temp_linksList[i - 1].target != temp_linksList[i].target) {
                linksList.push(temp_linksList[i]);
            } else {
                linksList[linksList.length-1].tableRows = linksList[linksList.length-1].tableRows.concat(temp_linksList[i].tableRows);
            }
        }
        
        return linksList;
    }


    // Utilities
    ns.clean_expression = function(expression){
        expression = expression || "";
        return expression.replace(/ +/gi, ' ').trim().toLowerCase();
    }
    ns.dehydrate_expression = function(expression){
        expression = expression || "";
        return expression.replace(/[^a-zA-Z0-9]*/gi, '').trim().toLowerCase();
    }
    ns.xmlEntities = function(expression) {
        expression = expression || "";
        return String(expression).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
})(jQuery, window.table2net = window.table2net || {})