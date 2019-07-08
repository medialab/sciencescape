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
        </div>

        <?php include("includes/footer.php"); ?>

        <?php include("includes/codebottom.php"); ?>

        <script src="js/page_scopus_utils.js"></script>

        <script>
            document.getElementById('scopusdoilinks_input').addEventListener('change', fileLoader.handleFileSelect, false);
        </script>
    </body>
</html>
