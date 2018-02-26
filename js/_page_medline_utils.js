var medlinedoilinks_data = '';
var medlinecsv_data = '';
var scopusnet_data = '';

// https://www.nlm.nih.gov/bsd/mms/medlineelements.html
var fieldTags = [
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
            case 'medlinedoilinks':
                medlinedoilinks_data = build_medlineDoiLinks(fileLoader.reader.result);
                if(medlinedoilinks_data){
                    $('#'+id+' .progress').hide()
                    $('#'+id+' .alert').addClass('alert-success')
                    $('#'+id+' .alert').html('Parsing successful <button type="button" class="close" data-dismiss="alert">&times;</button>')
                    $('#'+id+' .alert').show()
                    $('#medlinedoilinks_download').removeClass('disabled')
                } else {
                    $('#'+id+' .progress').hide()
                    $('#'+id+' .alert').addClass('alert-error')
                    $('#'+id+' .alert').html('Parsing error <button type="button" class="close" data-dismiss="alert">&times;</button>')
                    $('#'+id+' .alert').show()
                }
                break;
            case 'medlinecsv':
                medlinecsv_data = build_medlineCsv(fileLoader.reader.result);
                if(medlinecsv_data){
                    $('#'+id+' .progress').hide()
                    $('#'+id+' .alert').addClass('alert-success')
                    $('#'+id+' .alert').html('Parsing successful <button type="button" class="close" data-dismiss="alert">&times;</button>')
                    $('#'+id+' .alert').show()
                    $('#medlinecsv_download').removeClass('disabled')
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

function downloadMedlinecsv(){
    if(!$('#medlinecsv_download').hasClass('disabled')){
        console.log(medlinecsv_data[1])
        var headers = medlinecsv_data.shift();

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
        
        medlinecsv_data.forEach(function(items){
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
            ,filename = "MEDLINE.csv"
        if(navigator.userAgent.match(/firefox/i))
           alert('Note:\nFirefox does not handle file names, so you will have to rename this file to\n\"'+filename+'\""\nor some equivalent.')
        saveAs(blob, filename)
    }
}

function build_medlineCsv(medline){
    return convert_medline_to_CSV(medline, false)
}

function convert_medline_to_CSV(medline, extractDOI){
    var data = [];
    var currentFieldTag = "";
    var currentItem = {};
    var lines = medline.split("\n");
    var firstLine = lines.shift().trim()
    if (firstLine == ''){
        lines.forEach(function(line){
            if(line.trim() == '') {
                // New record
                data.push(currentItem);
                currentItem = new Object();
                return
            } else {
                var candidateFieldTag = line.substring(0,4).trim();
                if(candidateFieldTag != ""){
                    currentFieldTag = candidateFieldTag;
                }
            
                if(currentItem[currentFieldTag]){
                    currentItem[currentFieldTag].push(line.substring(6));
                } else {
                    currentItem[currentFieldTag] = [line.substring(6)];
                }
            }
        });
    } else {
        alert("There is a problem with the MEDLINE file");
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
            return (item[header] || []).join('|') || '';
        }))
    })
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