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
                        <p><strong>Helpers for scientometrics.</strong> Convert files, get networks, visualize stuff from Scopus or Web of Knowledge.</p>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="span4">
                    <h2>Web of Knowledge DOI Links</h2>
                    <p class="text-info">
                        Adds the list of citation links where there are DOI references, in a WoK file (classic or CSV).
                    </p>
                    <br/>
                    <h4>1. Upload your WoK file (or CSV)</h4>
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
                        <strong>This script does the same thing, but for Web of Knowledge.</strong>
                        It extracts the DOIs from the references and adds them to a new column "DOI_CITED".
                        You may use the resulting CSV to build a network with Table2Net.
                    </p>
                    <p>
                        <strong>Supported file formats</strong> are CSV as well as the WoK-specific format, usually a .txt file.
                        <strong>The detection is automatic.</strong> Just upload your file and the right algorithm will apply.
                    </p>


                </div>

                <div class="span4">
                    <h2>Web of Knowledge to CSV</h2>
                    <p class="text-info">
                        Get a CSV from a web of Knowledge specific file.
                    </p>
                    <br/>
                    <h4>1. Upload your WoK file</h4>
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
                        If you have a classic WOK export (text format, organized by two-letter codes and beginning with "FN"), it will be converted to a <a href="http://en.wikipedia.org/wiki/CSV">CSV file</a> containing the same information.
                    </p>


                </div>
                <div class="span4">
                    <h2>WoK tags explanation</h2>
                    <p class="text-info">
                        The two letter "field tags" in the Web of Knowledge files are documented <a href="http://images.webofknowledge.com/WOK45/help/WOS/h_fieldtags.html">on this page</a>.
                        Our tools add the explicit name to the field tag according to this list:
                    </p>
                    <ul id="fieldTags"></ul>
                </div>
            </div>
        </div>

        <?php include("includes/footer.php"); ?>

        <?php include("includes/codebottom.php"); ?>

        <script src="js/_page_wok_utils.js"></script>

        <script>
            document.getElementById('wosdoilinks_input').addEventListener('change', fileLoader.handleFileSelect, false);
            document.getElementById('woscsv_input').addEventListener('change', fileLoader.handleFileSelect, false);

            $('#fieldTags').html(fieldTags.map(function(ft){
                return '<li><strong>'+ft.tag+':</strong> '+ft.name+'</li>'
            }).join(''))
        </script>
    </body>
</html>
