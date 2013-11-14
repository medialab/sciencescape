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

            #chart {
              height: 500px;
              width: 100%;
            }

            .node rect {
              cursor: move;
              fill-opacity: .9;
              shape-rendering: crispEdges;
            }

            .node text {
              pointer-events: none;
              text-shadow: 0 1px 0 #fff;
            }

            .link {
              fill: none;
              stroke: #000;
              stroke-opacity: .2;
            }

            .link:hover {
              stroke-opacity: .5;
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
                    <h2>Volume of papers over time</h2>
                    <p class="text-info">
                        Upload a Scopus CSV file and look at how many papers are published each year (in your file)
                    </p>
                    <hr/>
                </div>
            </div>
            <div class="row">
                <div class="span4">
                    <div id="extract"><span class="muted">file uploader</span></div>
                </div>
                <div class="span4">
                    <div id="parsing"><span class="muted">parsing</span></div>
                </div>
                <div class="span4">
                    <div id="extraction"><span class="muted">extraction</span></div>
                </div>
            </div>
            <div class="row">
                <div class="span12">
                    <div id="chart"/>
                </div>
            </div>
        </div>

        <?php include("includes/footer.php"); ?>

        <?php include("includes/codebottom.php"); ?>

        <script src="js/libs/sankey_modified.js"></script>
        <script src="js/_paper_scopus_mostCitedPapersProfile.js"></script>

        <script>
            // document.getElementById('scopusextract_input').addEventListener('change', fileLoader.handleFileSelect, false);
        </script>
    </body>
</html>
