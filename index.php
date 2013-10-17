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

            .caption .description{
                height: 80px;
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
                <div class="span12">
                    <ul class="thumbnails">
                        <li class="span3">
                            <div class="thumbnail">
                                <img src="res/sciencescape_network.png">
                                <div class="caption">
                                    <h3>Get Networks</h3>
                                    <p class="description">Visualize and download networks of keywords and/or authors and/or journals, and more.</p>
                                    <p>
                                        <a href="scopus2net.php" class="btn btn-inverse">Scopus</a>
                                        <a href="wok2net.php" class="btn btn-inverse">Web of Knowledge</a>
                                    </p>
                                </div>
                            </div>
                        </li>
                        <li class="span3">
                            <div class="thumbnail">
                                <img src="res/sciencescape_papersvolumeevolution.png">
                                <div class="caption">
                                    <h3>Papers over time</h3>
                                    <p class="description">Visualize how many papers are published each year in your file</p>
                                    <p>
                                        <a href="scopus_papersvolume_evolution.php" class="btn btn-inverse">Scopus</a>
                                        <a href="wok_papersvolume_evolution.php" class="btn btn-inverse">Web of Knowledge</a>
                                    </p>
                                </div>
                            </div>
                        </li>
                        <li class="span3">
                            <div class="thumbnail">
                                <img src="res/sciencescape_kwevolution.png">
                                <div class="caption">
                                    <h3>Keywords over time</h3>
                                    <p class="description">Visualize and download the use of each keyword over time in your file</p>
                                    <p>
                                        <a href="scopus_keywords_evolution.php" class="btn btn-inverse">Scopus</a>
                                        <a href="wok_keywords_evolution.php" class="btn btn-inverse">Web of Knowledge</a>
                                    </p>
                                </div>
                            </div>
                        </li>
                        <li class="span3">
                            <div class="thumbnail">
                                <img src="res/sciencescape_kwtopperyear.png">
                                <div class="caption">
                                    <h3>Top keywords / year</h3>
                                    <p class="description">Visualize the most used keywords each year in your file</p>
                                    <p>
                                        <a href="scopus_keywords_topPerYear.php" class="btn btn-inverse">Scopus</a>
                                        <a href="wok_keywords_topPerYear.php" class="btn btn-inverse">Web of Knowledge</a>
                                    </p>
                                </div>
                            </div>
                        </li>
                        <li class="span3">
                            <div class="thumbnail">
                                <img src="res/sciencescape_journalsevolution.png">
                                <div class="caption">
                                    <h3>Journals over time</h3>
                                    <p class="description">Visualize and download the journals publishing the most papers over time in your file</p>
                                    <p>
                                        <a href="scopus_journals_evolution.php" class="btn btn-inverse">Scopus</a>
                                        <a href="wok_journals_evolution.php" class="btn btn-inverse">Web of Knowledge</a>
                                    </p>
                                </div>
                            </div>
                        </li>
                        <li class="span3">
                            <div class="thumbnail">
                                <img src="res/sciencescape_journalstopperyear.png">
                                <div class="caption">
                                    <h3>Top journals / year</h3>
                                    <p class="description">Visualize journals publishing the most papers each year in your file</p>
                                    <p>
                                        <a href="scopus_journals_topPerYear.php" class="btn btn-inverse">Scopus</a>
                                        <a href="wok_journals_topPerYear.php" class="btn btn-inverse">Web of Knowledge</a>
                                    </p>
                                </div>
                            </div>
                        </li>
                        <li class="span3">
                            <div class="thumbnail">
                                <img src="res/sciencescape_utils.png">
                                <div class="caption">
                                    <h3>Utilities</h3>
                                    <p class="description">Extract DOI links from your file, and more</p>
                                    <p>
                                        <a href="scopus_utils.php" class="btn btn-inverse">Scopus</a>
                                        <a href="wok_utils.php" class="btn btn-inverse">Web of Knowledge</a>
                                    </p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <?php include("includes/footer.php"); ?>

        <?php include("includes/codebottom.php"); ?>

        <script src="js/_page_index.js"></script>
    </body>
</html>
