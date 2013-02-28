<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>ScienceScape</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width">

<?php include('includes/config_management.php') ?>
<?php include('includes/codetop.php') ?>
        <style>


            body {
                padding-top: 60px;
                padding-bottom: 40px;
            }
        </style>

    </head>
    <body>
        <!--[if lt IE 7]>
            <p class="chromeframe">You are using an outdated browser. <a href="http://browsehappy.com/">Upgrade your browser today</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to better experience this site.</p>
        <![endif]-->

<?php include('includes/header.php') ?>




        <div class="container">

            <!-- Main hero unit for a primary marketing message or call to action -->
            <div class="splash-unit row">
                <div class="span7">
                    <div class="image">
                        <a href="index.php"><img src="res/header.png"/></a>
                    </div>
                    <div class="title">
                        ScienceScape
                    </div>
                </div>
                <div class="span5">
                    <div class="abstract">
                        <p><strong>Helpers for scientometrics.</strong> Convert files, get networks, visualize stuff from Scopus or Web of Science.</p>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="span12">
                    <h2>Scopus to network</h2>
                    <p class="text-info">
                        Extract a network from a Scopus file and download it. You may visualize it with <a href="http://gephi.org">Gephi</a>.
                    </p>
                </div>
            </div>
            <div class="row">
                <div class="span4">
                    <h4>1. Upload your Scopus CSV file</h4>
                        <div id="scopusextractlinks" style="height: 50px">
                            <div class="input">
                                <input type="file" name="file" id='scopusextractlinks_input'/>
                                <span class="help-block">Note: you can drag and drop a file</span>
                            </div>
                            <div class="progress" style="display: none;">
                                <div class="bar" style="width: 0%;"></div>
                            </div>
                            <div class="alert" style="display: none;">
                            </div>
                        </div>
                    </p>
                    <h4>2. Type of network</h4>
                    <!-- <p>
                        <label class="checkbox">
                            <input type="checkbox" value="" checked="true">
                            Add DOI links
                        </label>
                    </p> -->
                    <br/>
                    <h4>3. Download network</h4>
                    <p>
                        <button class="btn disabled" id="scopusextractlinks_download" onclick="downloadScopusextractlinks()"><i class="icon-download"></i> Build and download GEXF</button>
                    </p>
                    <br/>
                    <h4>Help</h4>
                    <p>
                        This script is useful if you want to extract a network from a Scopus file.
                    </p>
                </div>
                <div class="span8">
                    <h4>Network preview</h4>
                    <div class="sigmaDiv" style="width:100%; height: 400px; border: 1px solid #CCC;"></div>
                    <br/>
                    <br/>
                    <br/>
                </div>
            </div>

            <div class="row">
                <div class="span4">
                    <h2>Scopus DOI Links</h2>
                    <p class="text-info">
                        Adds the list of citation links where there are DOI references, in a Scopus CSV file.
                    </p>
                    <br/>
                    <h4>1. Upload your Scopus CSV file</h4>
                        <div id="scopusdoilinks" style="height: 50px">
                            <div class="input">
                                <input type="file" name="file" id='scopusdoilinks_input'/>
                                <span class="help-block">Note: you can drag and drop a file</span>
                            </div>
                            <div class="progress" style="display: none;">
                                <div class="bar" style="width: 0%;"></div>
                            </div>
                            <div class="alert" style="display: none;">
                            </div>
                        </div>
                    </p>
                    <!-- <h4>2. Settings</h4>
                    <p>
                        <label class="checkbox">
                            <input type="checkbox" value="" checked="true">
                            Add DOI links
                        </label>
                    </p> -->
                    <br/>
                    <h4>2. Download result</h4>
                    <p>
                        <button class="btn disabled" id="scopusdoilinks_download" onclick="downloadScopusdoilinks()"><i class="icon-download"></i> Download CSV with DOI links</button>
                    </p>
                    <br/>
                    <h4>Help</h4>
                    <p>
                        This script is useful if you want to build a network of citations.
                    </p>
                    <p>
                        The problem is to match the papers of the table with the papers in the references.
                        The titles might have variations or discrepancies, messing up the matching.
                        The solution is to use exact identifiers.
                    </p>
                    <p>
                        Such identifiers exist in the world of scientometrics: the DOI, or <a href="http://en.wikipedia.org/wiki/Digital_object_identifier">"Digital Object Identifier"</a>.
                        They are sometimes present in the list of papers, and they are sometimes present in the references.
                    </p>
                    <p>
                        <strong>This tool extracts the DOIs from the references and adds them to a new column.</strong>
                        You may use the resulting CSV to build a network with Table2Net.
                    </p>

                </div>

                <div class="span4">
                    <h2>Web of Science DOI Links</h2>
                    <p class="text-info">
                        Adds the list of citation links where there are DOI references, in a WoS file (classic or CSV).
                    </p>
                    <br/>
                    <h4>1. Upload your WoS file (or CSV)</h4>
                        <div id="wosdoilinks" style="height: 50px">
                            <div class="input">
                                <input type="file" name="file" id='wosdoilinks_input'/>
                                <span class="help-block">Note: you can drag and drop a file</span>
                            </div>
                            <div class="progress" style="display: none;">
                                <div class="bar" style="width: 0%;"></div>
                            </div>
                            <div class="alert" style="display: none;">
                            </div>
                        </div>
                    </p>
                    <!-- <br/>
                    <h4>2. Settings</h4>
                    <p>
                        <label class="checkbox">
                            <input type="checkbox" id="wosdoilinks_filetype" value="">
                            CSV file
                        </label>
                    </p> -->
                    <br/>
                    <h4>2. Download result</h4>
                    <p>
                        <button class="btn disabled" id="wosdoilinks_download" onclick="downloadWosdoilinks()"><i class="icon-download"></i> Download CSV with DOI links</button>
                    </p>
                    <br/>
                    <h4>Help</h4>
                    <p>
                        <strong>This script does the same thing, but for Web of Science.</strong>
                        It extracts the DOIs from the references and adds them to a new column "DOI_CITED".
                        You may use the resulting CSV to build a network with Table2Net.
                    </p>
                    <p>
                        <strong>Supported file formats</strong> are CSV as well as the WoS-specific format, usually a .txt file.
                        <strong>The detection is automatic.</strong> Just upload your file and the right algorithm will apply.
                    </p>
                    

                </div>

                <div class="span4">
                    <h2>Web of Science to CSV</h2>
                    <p class="text-info">
                        Get a CSV from a web of science specific file.
                    </p>
                    <br/>
                    <h4>1. Upload your WoS file</h4>
                        <div id="woscsv" style="height: 50px">
                            <div class="input">
                                <input type="file" name="file" id='woscsv_input'/>
                                <span class="help-block">Note: you can drag and drop a file</span>
                            </div>
                            <div class="progress" style="display: none;">
                                <div class="bar" style="width: 0%;"></div>
                            </div>
                            <div class="alert" style="display: none;">
                            </div>
                        </div>
                    </p>
                    <br/>
                    <h4>2. Download result</h4>
                    <p>
                        <button class="btn disabled" id="woscsv_download" onclick="downloadWoscsv()"><i class="icon-download"></i> Download CSV</button>
                    </p>
                    <br/>
                    <h4>Help</h4>
                    <p>
                        If you have a classic WOS export (text format, organized by two-letter codes and beginning with "FN"), it will be converted to a <a href="http://en.wikipedia.org/wiki/CSV">CSV file</a> containing the same information.
                    </p>
                    

                </div>
            </div>
            <div class="row">
                <div class="span12"><hr/></div>
            </div>
            <div class="row">
                <div class="span4">
                    <h2>WoS tags explanation</h2>
                    <p class="text-info">
                        The two letter "field tags" in the Web of Science files are documented <a href="http://images.webofknowledge.com/WOK45/help/WOS/h_fieldtags.html">on this page</a>.
                        Our tools add the explicit name to the field tag according to this list:
                    </p>
                    <ul id="fieldTags"></ul>
                </div>
            </div>
        </div>

        <?php include("includes/footer.php"); ?>

        <?php include("includes/codebottom.php"); ?>

        <script>
            document.getElementById('scopusextractlinks_input').addEventListener('change', fileLoader.handleFileSelect, false);
            document.getElementById('scopusdoilinks_input').addEventListener('change', fileLoader.handleFileSelect, false);
            document.getElementById('wosdoilinks_input').addEventListener('change', fileLoader.handleFileSelect, false);
            document.getElementById('woscsv_input').addEventListener('change', fileLoader.handleFileSelect, false);

            $('#fieldTags').html(fieldTags.map(function(ft){
                return '<li><strong>'+ft.tag+':</strong> '+ft.name+'</li>'
            }).join(''))
        </script>
    </body>
</html>
