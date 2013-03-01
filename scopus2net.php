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
                        <div id="scopusextract"></div>
                        <!-- <div id="scopusextract" style="height: 50px">
                            <div class="input">
                                <input type="file" name="file" id='scopusextract_input'/>
                                <span class="help-block">Note: you can drag and drop a file</span>
                            </div>
                            <div class="progress" style="display: none;">
                                <div class="bar" style="width: 0%;"></div>
                            </div>
                            <div class="alert" style="display: none;">
                            </div>
                        </div> -->
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
                        <button class="btn disabled" id="scopusextract_download" onclick="downloadScopusextract()"><i class="icon-download"></i> Build and download GEXF</button>
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
        </div>

        <?php include("includes/footer.php"); ?>

        <?php include("includes/codebottom.php"); ?>

        <script src="js/_page_scopus2net.js"></script>

        <script>
            // document.getElementById('scopusextract_input').addEventListener('change', fileLoader.handleFileSelect, false);
        </script>
    </body>
</html>
