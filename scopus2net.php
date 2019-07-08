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

            #uploadDiv {
                margin-bottom: 50px;
            }

            /* sigma */
            .sigma-parent {
                position: relative;

                /*background-color: #f8f8f8;*/

                /* from http://www.colorzilla.com/gradient-editor/ */
                background: rgb(242,242,242); /* Old browsers */
                background: -moz-linear-gradient(top,  rgba(242,242,242,1) 0%, rgba(244,244,244,1) 43%, rgba(252,252,252,1) 100%); /* FF3.6+ */
                background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(242,242,242,1)), color-stop(43%,rgba(244,244,244,1)), color-stop(100%,rgba(252,252,252,1))); /* Chrome,Safari4+ */
                background: -webkit-linear-gradient(top,  rgba(242,242,242,1) 0%,rgba(244,244,244,1) 43%,rgba(252,252,252,1) 100%); /* Chrome10+,Safari5.1+ */
                background: -o-linear-gradient(top,  rgba(242,242,242,1) 0%,rgba(244,244,244,1) 43%,rgba(252,252,252,1) 100%); /* Opera 11.10+ */
                background: -ms-linear-gradient(top,  rgba(242,242,242,1) 0%,rgba(244,244,244,1) 43%,rgba(252,252,252,1) 100%); /* IE10+ */
                background: linear-gradient(to bottom,  rgba(242,242,242,1) 0%,rgba(244,244,244,1) 43%,rgba(252,252,252,1) 100%); /* W3C */
                filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#f2f2f2', endColorstr='#fcfcfc',GradientType=0 ); /* IE6-9 */


                border: 1px solid #e3e3e3;
                -webkit-border-radius: 4px;
                -moz-border-radius: 4px;
                border-radius: 4px;
                -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
                -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
                box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);

                margin-bottom: 2px;
                height: 380px;
            }

            .sigma-expand {
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
            }


            /* Report */
            #report {
                padding: 3px;
                background: #eee;
                border-radius: 3px;
            }
            #report div.inner {
                border: 1px solid #ccc;
                background: #FDFDFD;
                padding-left: 16px;
            }
            .reportText {
                font-family: monospace;
                white-space: pre;
                margin: 1em 0px;
                font-family: Consolas, "Liberation Mono", Courier, monospace;
                font-size: 12px;
            }

        </style>

        <link href='http://fonts.googleapis.com/css?family=Roboto:400,300,700|Roboto+Condensed:400,300,700' rel='stylesheet' type='text/css'>

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
                    <h2>Scopus to Network</h2>
                    <p class="text-info">
                        Extract a network from a Scopus file and download it. You may visualize it with <a href="http://gephi.org">Gephi</a>.
                    </p>
                    <hr/>
                </div>
            </div>
            <div class="row">
                <div class="span4">
                    <div id="uploadDiv">
                        <h4>Upload your Scopus CSV file</h4>
                        <div id="scopusextract"><span class="muted">file uploader</span></div>
                    </div>
                    <div id="settingsDiv" style="display: none">
                        <h4>Settings</h4>
                        <div id="typeofnet"><span class="muted">type of network to extract</span></div>
                        <form>
                            <fieldset>
                                <label>Filtering</label>
                                <!-- <span class="help-block">Example block-level help text here.</span> -->
                                <select id="minDegreeThreshold" class="input-block-level">
                                    <option value="0">No filter</option>
                                    <option value="1">Remove disconnected nodes</option>
                                    <!-- <option value="2r">Get only nodes with 2+ links (recursive)</option> -->
                                    <option value="2dn">Remove nodes &lt; 2 links, then disconnected nodes</option>
                                    <option value="3dn">Remove nodes &lt; 3 links, then disconnected nodes</option>
                                    <!-- <option value="3">Remove nodes with less than 3 links</option>
                                    <option value="4">Remove nodes with less than 4 links</option>
                                    <option value="5">Remove nodes with less than 5 links</option> -->
                                </select>
                            </fieldset>
                        </form>
                        <div id="build"><span class="muted">Build network button</span></div>
                    </div>
                </div>
                <div class="span8">
                    <div id="networkDiv" style="display:none;">
                        <h4>Network preview</h4>
                        <div id="sigmaContainer"><span class="muted">network preview</span></div>
                        <div class="row">
                            <div class="span5">
                                <div id="sigmaButtons"><span class="muted">sigma buttons</span></div>
                            </div>
                            <div class="span3">
                                <div id="download" class="pull-right"><span class="muted">download</span></div><br/>
                            </div>
                        </div>
                        <br/><br/>
                        <h4>Report</h4>
                        <div id="report">
                            <div class="inner">
                                <div class="reportText"/>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>

        <?php include("includes/footer.php"); ?>

        <?php include("includes/codebottom.php"); ?>

        <script src="js/libs/sigma.js"></script>
        <script src="js/libs/sigma-forceatlas2-worker.js"></script>
        <script src="js/libs/sigma-forceatlas2-supervisor.js"></script>

        <script src="js/_page_scopus2net.js"></script>

        <script>
            // document.getElementById('scopusextract_input').addEventListener('change', fileLoader.handleFileSelect, false);
        </script>
    </body>
</html>
