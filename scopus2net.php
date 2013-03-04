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



            /* sigma */
            .sigma-parent {
                position: relative;
                border-radius: 4px;
                -moz-border-radius: 4px;
                -webkit-border-radius: 4px;
                background: #F9F9F9;
                height: 300px;
            }

            .sigma-expand {
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
            }

            .buttons-container{
                padding-bottom: 8px;
                padding-top: 12px;
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
                    <h4>Upload your Scopus CSV file</h4>
                    <div id="scopusextract"><span class="muted">file uploader</span></div>
                    <br/>
                    <h4>Parsing</h4>
                    <div id="parsing"><span class="muted">parsing</span></div>
                    <br/>
                    <h4>Settings</h4>
                    <div id="typeofnet"><span class="muted">type of network to extract</span></div>
                    <form>
                        <fieldset>
                            <label>Filtering settings</label>
                            <!-- <span class="help-block">Example block-level help text here.</span> -->
                            <label class="checkbox">
                                <input id="removeMostConnected" type="checkbox"> Remove overconnected nodes
                            </label>
                            <select id="minDegreeThreshold" class="input-block-level">
                                <option value="0">Keep all</option>
                                <option value="1">Keep nodes connected to 1+ neighbors</option>
                                <option value="2">Keep nodes connected to 2+ neighbors</option>
                                <option value="3">Keep nodes connected to 3+ neighbors</option>
                                <option value="4">Keep nodes connected to 4+ neighbors</option>
                                <option value="5">Keep nodes connected to 5+ neighbors</option>
                            </select>
                        </fieldset>
                    </form>
                    <h4>Build network</h4>
                    <div id="build"><span class="muted">build</span></div>
                    <br/>
                    <h4>Download</h4>
                    <div id="download"><span class="muted">download</span></div><br/>
                    <h4>Help</h4>
                    <p>
                        This script is useful if you want to extract a network from a Scopus file.
                    </p>
                </div>
                <div class="span8">
                    <h4>Network preview</h4>
                    <div id="sigmaDiv"><span class="muted">network preview</span></div>
                    <div id="alerts"></div>
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
