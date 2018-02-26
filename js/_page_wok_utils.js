var wosdoilinks_data = '';
var woscsv_data = '';
var scopusnet_data = '';

// http://images.webofknowledge.com/WOK45/help/WOS/h_fieldtags.html
var fieldTags = [
    {tag:"FN",  name:"File Name"},
    {tag:"VR",  name:"Version Number"},
    {tag:"PT",  name:"Publication Type"},
    {tag:"AU",  name:"Authors"},
    {tag:"AF",  name:"Author Full Name"},
    {tag:"CA",  name:"Group Authors"},
    {tag:"TI",  name:"Document Title"},
    {tag:"ED",  name:"Editors"},
    {tag:"SO",  name:"Publication Name"},
    {tag:"SE",  name:"Book Series Title"},
    {tag:"BS",  name:"Book Series Subtitle"},
    {tag:"LA",  name:"Language"},
    {tag:"DT",  name:"Document Type"},
    {tag:"CT",  name:"Conference Title"},
    {tag:"CY",  name:"Conference Date"},
    {tag:"HO",  name:"Conference Host"},
    {tag:"CL",  name:"Conference Location"},
    {tag:"SP",  name:"Conference Sponsors"},
    {tag:"DE",  name:"Author Keywords"},
    {tag:"ID",  name:"Keywords Plus®"},
    {tag:"AB",  name:"Abstract"},
    {tag:"C1",  name:"Author Address"},
    {tag:"RP",  name:"Reprint Address"},
    {tag:"EM",  name:"E-mail Address"},
    {tag:"FU",  name:"Funding Agency and Grant Number"},
    {tag:"FX",  name:"Funding Text"},
    {tag:"CR",  name:"Cited References"},
    {tag:"NR",  name:"Cited Reference Count"},
    {tag:"TC",  name:"Times Cited"},
    {tag:"PU",  name:"Publisher"},
    {tag:"PI",  name:"Publisher City"},
    {tag:"PA",  name:"Publisher Address"},
    {tag:"SC",  name:"Subject Category"},
    {tag:"SN",  name:"ISSN"},
    {tag:"BN",  name:"ISBN"},
    {tag:"J9",  name:"29-Character Source Abbreviation"},
    {tag:"JI",  name:"ISO Source Abbreviation"},
    {tag:"PD",  name:"Publication Date"},
    {tag:"PY",  name:"Year Published"},
    {tag:"VL",  name:"Volume"},
    {tag:"IS",  name:"Issue"},
    {tag:"PN",  name:"Part Number"},
    {tag:"SU",  name:"Supplement"},
    {tag:"SI",  name:"Special Issue"},
    {tag:"BP",  name:"Beginning Page"},
    {tag:"EP",  name:"Beginning Page"},
    {tag:"AR",  name:"Article Number"},
    {tag:"PG",  name:"Page Count"},
    {tag:"DI",  name:"Digital Object Identifier (DOI)"},
    {tag:"GA",  name:"Document Delivery Number"},
    {tag:"UT",  name:"Unique Article Identifier"},
    {tag:"ER",  name:"End of Record"},
    {tag:"EF",  name:"End of File"},
    {tag:"DOI_CITED",   name:"Cited papers having a DOI"}
];

var fieldTags_MEDLINE = [
    {tag:"AB", name:"Abstract"},
    {tag:"CI", name:"Copyright Information"},
    {tag:"AD", name:"Affiliation"},
    {tag:"IRAD", name:"Investigator Affiliation"},
    {tag:"AID", name:"Article Identifier"},
    {tag:"AU", name:"Author"},
    {tag:"AUID", name:"Author Identifier"},
    {tag:"FAU", name:"Full Author"},
    {tag:"BTI", name:"Book Title"},
    {tag:"CTI", name:"Collection Title"},
    {tag:"COIS", name:"Conflict of Interest Statement"},
    {tag:"CN", name:"Corporate Author"},
    {tag:"CRDT", name:"Create Date"},
    {tag:"DCOM", name:"Date Completed"},
    {tag:"DA", name:"Date Created"},
    {tag:"LR", name:"Date Last Revised"},
    {tag:"DEP", name:"Date of Electronic Publication"},
    {tag:"DP", name:"Date of Publication"},
    {tag:"EN", name:"Edition"},
    {tag:"ED", name:"Editor"},
    {tag:"FED", name:"Full Editor Name"},
    {tag:"EDAT", name:"Entrez Date"},
    {tag:"GS", name:"Gene Symbol"},
    {tag:"GN", name:"General Note"},
    {tag:"GR", name:"Grant Number"},
    {tag:"IR", name:"Investigator Name"},
    {tag:"FIR", name:"Full Investigator Name"},
    {tag:"ISBN", name:"ISBN"},
    {tag:"IS", name:"ISSN"},
    {tag:"IP", name:"Issue"},
    {tag:"TA", name:"Journal Title Abbreviation"},
    {tag:"JT", name:"Journal Title"},
    {tag:"LA", name:"Language"},
    {tag:"LID", name:"Location Identifier"},
    {tag:"MID", name:"Manuscript Identifier"},
    {tag:"MHDA", name:"MeSH Date"},
    {tag:"MH", name:"MeSH Terms"},
    {tag:"NLM", name:"NLM Unique ID"},
    {tag:"RF", name:"Number of References"},
    {tag:"OAB", name:"Other Abstract"},
    {tag:"OCI", name:"Other Copyright Information"},
    {tag:"OID", name:"Other ID"},
    {tag:"OT", name:"Other Term"},
    {tag:"OTO", name:"Other Term Owner"},
    {tag:"OWN", name:"Owner"},
    {tag:"PG", name:"Pagination"},
    {tag:"PS", name:"Personal Name as Subject   "},
    {tag:"FPS", name:"Full Personal Name as Subject"},
    {tag:"PL", name:"Place of Publication"},
    {tag:"PHST", name:"Publication History Status"},
    {tag:"PST", name:"Publication Status"},
    {tag:"PT", name:"Publication Type"},
    {tag:"PUBM", name:"Publishing Model"},
    {tag:"PMC", name:"PubMed Central Identifier"},
    {tag:"PMCR", name:"PubMed Central Release"},
    {tag:"PMID", name:"PubMed Unique Identifier"},
    {tag:"RN", name:"Registry Number/EC Number"},
    {tag:"NM", name:"Substance Name"},
    {tag:"SI", name:"Secondary Source ID"},
    {tag:"SO", name:"Source"},
    {tag:"SFM", name:"Space Flight Mission"},
    {tag:"STAT", name:"Status"},
    {tag:"SB", name:"Subset"},
    {tag:"TI", name:"Title"},
    {tag:"TT", name:"Transliterated Title"},
    {tag:"VI", name:"Volume"},
    {tag:"VTI", name:"Volume Title"}
];

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
            case 'scopusdoilinks':
                scopusdoilinks_data = build_scopusDoiLinks(fileLoader.reader.result);
                if(scopusdoilinks_data){
                    $('#'+id+' .progress').hide()
                    $('#'+id+' .alert').addClass('alert-success')
                    $('#'+id+' .alert').html('Parsing successful <button type="button" class="close" data-dismiss="alert">&times;</button>')
                    $('#'+id+' .alert').show()
                    $('#scopusdoilinks_download').removeClass('disabled')
                } else {
                    $('#'+id+' .progress').hide()
                    $('#'+id+' .alert').addClass('alert-error')
                    $('#'+id+' .alert').html('Parsing error <button type="button" class="close" data-dismiss="alert">&times;</button>')
                    $('#'+id+' .alert').show()
                }
                break;
            case 'wosdoilinks':
                wosdoilinks_data = build_wosDoiLinks(fileLoader.reader.result);
                if(wosdoilinks_data){
                    $('#'+id+' .progress').hide()
                    $('#'+id+' .alert').addClass('alert-success')
                    $('#'+id+' .alert').html('Parsing successful <button type="button" class="close" data-dismiss="alert">&times;</button>')
                    $('#'+id+' .alert').show()
                    $('#wosdoilinks_download').removeClass('disabled')
                } else {
                    $('#'+id+' .progress').hide()
                    $('#'+id+' .alert').addClass('alert-error')
                    $('#'+id+' .alert').html('Parsing error <button type="button" class="close" data-dismiss="alert">&times;</button>')
                    $('#'+id+' .alert').show()
                }
                break;
            case 'woscsv':
                woscsv_data = build_wosCsv(fileLoader.reader.result);
                if(woscsv_data){
                    $('#'+id+' .progress').hide()
                    $('#'+id+' .alert').addClass('alert-success')
                    $('#'+id+' .alert').html('Parsing successful <button type="button" class="close" data-dismiss="alert">&times;</button>')
                    $('#'+id+' .alert').show()
                    $('#woscsv_download').removeClass('disabled')
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

function downloadWosdoilinks(){
    if(!$('#wosdoilinks_download').hasClass('disabled')){
        var headers = wosdoilinks_data.shift();

        var content = []
        
        content.push(headers.map(function(header){
            var result = header;
            fieldTags.forEach(function(ft){
                if(ft.tag==header){
                    result += " ("+ft.name+")";
                }
            });
            return result;
        }).map(function(header){
            return '"' + header.replace(/"/gi, '""') + '"';
        }).join(","));
        
        wosdoilinks_data.forEach(function(items){
            content.push("\n" + items.map(function(item){
                var cell = item || '';
                return '"' + cell.replace(/"/gi, '""') + '"';
            }).join(","));
        });
        
        $("#progress_bar_message").addClass("success_message");
        $("#validation").addClass("open");
        setTimeout('$("#progress_bar").removeClass("loading");', 2000);
        
        // Save file
        var blob = new Blob(content, {'type':'text/csv;charset=utf-8'})
            ,filename = "Web of Science with DOI Links.csv"
        if(navigator.userAgent.match(/firefox/i))
           alert('Note:\nFirefox does not handle file names, so you will have to rename this file to\n\"'+filename+'\""\nor some equivalent.')
        saveAs(blob, filename)
    }
}

function downloadWoscsv(){
    if(!$('#woscsv_download').hasClass('disabled')){
        console.log(woscsv_data[1])
        var headers = woscsv_data.shift();

        var content = []
        
        content.push(headers.map(function(header){
            var result = header;
            fieldTags.forEach(function(ft){
                if(ft.tag==header){
                    result += " ("+ft.name+")";
                }
            });
            return result;
        }).map(function(header){
            return '"' + header.replace(/"/gi, '""') + '"';
        }).join(","));
        
        woscsv_data.forEach(function(items){
            content.push("\n" + items.map(function(item){
                var cell = item || '';
                return '"' + cell.replace(/"/gi, '""') + '"';
            }).join(","));
        });
        
        $("#progress_bar_message").addClass("success_message");
        $("#validation").addClass("open");
        setTimeout('$("#progress_bar").removeClass("loading");', 2000);
        
        // Save file
        var blob = new Blob(content, {'type':'text/csv;charset=utf-8'})
            ,filename = "Web of Science.csv"
        if(navigator.userAgent.match(/firefox/i))
           alert('Note:\nFirefox does not handle file names, so you will have to rename this file to\n\"'+filename+'\""\nor some equivalent.')
        saveAs(blob, filename)
    }
}

function parseWOS(wos){
    var lines = wos.split("\n");
    var headline = lines.shift().split("\t");
    var CR_index = -1;
    headline.forEach(function(h,i){
        if(h == "CR"){
            CR_index = i;
        }
    });
    var csvRows = [headline];
    lines.forEach(function(line){
        var row = line.split("\t");
        if(CR_index>=0 && CR_index < row.length){
            // Extract DOI reference of the cited paper if applicable
            var doi_refs = d3.merge(row[CR_index]
                .split(";")
                .map(function(ref){
                    return ref.split(",").filter(function(d){
                        return d.match(/ +DOI.*/gi);
                    });
                })).map(function(doi){
                    return doi.trim().split(" ")[1] || "";
                }).filter(function(doi){
                    return doi.trim() != "";
                });
            row.unshift(doi_refs.join("; "));
        } else {
            row.unshift("");
        }
        csvRows.push(row);
    });
    
    headline.unshift("DOI_CITED");
    return csvRows;
}

function build_wosDoiLinks(wos){
    if ( wos.substring(0,2) != "FN" ){
    // if ( $('#wosdoilinks_filetype').is( ':checked' ) ){
        return build_DoiLinks(wos, d3.csv.parseRows, 'CR', 'DOI_CITED')
    } else {
        return convert_wos_to_CSV(wos, true)
    }
}

function build_wosCsv(wos){
    return convert_wos_to_CSV(wos, false)
}

function convert_wos_to_CSV(wos, extractDOI){
    var data = [];
    var currentFieldTag = "";
    var currentItem = {};
    var lines = wos.split("\n");
    if(lines.shift().substring(0,2) == "FN"){
        lines.forEach(function(line){
            var candidateFieldTag = line.substring(0,2);
            if(candidateFieldTag != "  "){
                currentFieldTag = candidateFieldTag;
            }
            
            if(currentFieldTag == "ER"){
                data.push(currentItem);
                currentItem = new Object();
            } else {
                if(currentItem[currentFieldTag]){
                    if(currentFieldTag=="AU"
                        || currentFieldTag=="AF"
                        || currentFieldTag=="C1"
                        || currentFieldTag=="CR"
                    ){
                        currentItem[currentFieldTag] += "|" + line.substring(3);
                    } else {
                        currentItem[currentFieldTag] += " " + line.substring(3);
                    }
                    
                    // Extract citations
                    if(currentFieldTag=="CR" && extractDOI){
                        // Extract DOI reference of the cited paper if applicable
                        var doi_refs = line.substring(3).match(/DOI.*/gi);
                        if(doi_refs && doi_refs.length>0){
                            if(currentItem["DOI_CITED"]){
                                currentItem["DOI_CITED"] += "|" + doi_refs[0].split(" ")[1];
                            } else {
                                currentItem["DOI_CITED"] = doi_refs[0].split(" ")[1];
                            }
                        }
                    }
                } else {
                    currentItem[currentFieldTag] = line.substring(3);
                }
            }
        });
    } else {
        alert("There is a problem with the WOS file\n(No FileName fieldtag)");
    }

    // At this point, data is a list of objects.
    // Convert it to CSV

    var headers = []
    data.forEach(function(item){
        for(i in item){
            if(!headers.some(function(x){return x==i;})){
                headers.push(i)
            }
        }
    });

    var csvRows = []
    csvRows.push(headers)

    data.forEach(function(item){
        csvRows.push(headers.map(function(header){
            return item[header] || '';
        }))
    })
    return csvRows
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