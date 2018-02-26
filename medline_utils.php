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
                        <p><strong>Helpers for scientometrics.</strong> Convert files, get networks, visualize stuff from Scopus or Web of Knowledge.</p>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="span4">
                    <h2>Medline/PubMed to CSV</h2>
                    <p class="text-info">
                        Get a CSV from a MEDLINE specific file.
                    </p>
                    <br/>
                    <h4>1. Upload your MEDLINE file</h4>
                        <div id="medlinecsv" style="height: 50px">
                            <div class="input">
                                <input type="file" name="file" id='medlinecsv_input'/>
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
                        <button class="btn disabled" id="medlinecsv_download" onclick="downloadMedlinecsv()"><i class="icon-download"></i> Download CSV</button>
                    </p>
                    <br/>
                    <h4>Help</h4>
                    <p>
                        If you have a classic MEDLINE or PUBMED export (text format, organized by codes and beginning with "PMID"), it will be converted to a <a href="http://en.wikipedia.org/wiki/CSV">CSV file</a> containing the same information.
                    </p>
                    

                </div>
                <div class="span4">
                    <h2>MEDLINE tags explanation</h2>
                    <p class="text-info">
                        The "field tags" in the MEDLINE files are documented <a href="https://www.nlm.nih.gov/bsd/mms/medlineelements.html">on this page</a>.
                        Our tools add the explicit name to the field tag according to this list:
                    </p>
                    <ul id="fieldTags"></ul>
                </div>
            </div>
        </div>

        <?php include("includes/footer.php"); ?>

        <?php include("includes/codebottom.php"); ?>

        <script src="js/_page_medline_utils.js"></script>

        <script>
            document.getElementById('medlinecsv_input').addEventListener('change', fileLoader.handleFileSelect, false);

            $('#fieldTags').html(fieldTags.map(function(ft){
                return '<li><strong>'+ft.tag+':</strong> '+ft.name+'</li>'
            }).join(''))
        </script>
    </body>
</html>
