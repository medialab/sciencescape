var scopusnet_data = '';

var fileLoader = {
    reader:undefined,
    abortRead:function(){
        fileLoader.reader.abort();
    },
    errorHandler:function(evt){
        switch(evt.target.error.code) {
            case evt.target.error.NOT_FOUND_ERR:
                alert('File Not Found!');
                break;
            case evt.target.error.NOT_READABLE_ERR:
                alert('File is not readable');
                break;
            case evt.target.error.ABORT_ERR:
                break; // noop
            default:
                alert('An error occurred reading this file.');
        };
    },
    updateProgress:function(evt){
        // evt is an ProgressEvent.
        if (evt.lengthComputable) {
            var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
            // Increase the progress bar length.
            if (percentLoaded < 100) {
                var target = evt.target || evt.srcElement
                var bar = $(target).parent().siblings('.progress').children('.bar')
                bar.css('width', percentLoaded + '%')
                bar.text(percentLoaded + '%')
            }
        }
    },
    handleFileSelect: function(evt) {
        // Reset progress indicator on new file selection.
        var target = evt.target || evt.srcElement
        $(target).parent().hide()
        $(target).parent().siblings('.progress').show()
        var bar = $(target).parent().siblings('.progress').children('.bar')
        bar.css('width', '0%')
        
        fileLoader.reader = new FileReader();
        fileLoader.reader.onerror = fileLoader.errorHandler;
        fileLoader.reader.onprogress = fileLoader.updateProgress;
        fileLoader.reader.onabort = function(e) {
            alert('File read cancelled');
        };
        fileLoader.reader.onloadstart = function(e) {
            var target = evt.target || evt.srcElement
            var bar = $(target).parent().siblings('.progress').children('.bar')
            bar.removeClass("bar-success")
            bar.removeClass("bar-warning")
        };
        fileLoader.reader.onload = function(e) {
            // Ensure that the progress bar displays 100% at the end.
            var target = evt.target || evt.srcElement
            var bar = $(target).parent().siblings('.progress').children('.bar')
            bar.css('width', '100%')
            bar.text('Reading: 100% - parsing...')
            setTimeout("fileLoader.finalize('"+target.parentNode.parentNode.id+"');", 2000)
        }
        
        fileLoader.reader.readAsText(evt.target.files[0]);
    },
    
    finalize: function(id){
        switch(id){
            case 'scopusextract':
                scopusnet_data = build_scopusDoiLinks(fileLoader.reader.result)
                if(scopusnet_data){
                    $('#'+id+' .progress').hide()
                    $('#'+id+' .alert').addClass('alert-success')
                    $('#'+id+' .alert').html('Parsing successful <button type="button" class="close" data-dismiss="alert">&times;</button>')
                    $('#'+id+' .alert').show()
                    $('#scopusextract_download').removeClass('disabled')
                } else {
                    $('#'+id+' .progress').hide()
                    $('#'+id+' .alert').addClass('alert-error')
                    $('#'+id+' .alert').html('Parsing error <button type="button" class="close" data-dismiss="alert">&times;</button>')
                    $('#'+id+' .alert').show()
                }
                break;
            default:
                alert('Unknown file loader');
                break;
        }
    }
}

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