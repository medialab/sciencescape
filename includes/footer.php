	<footer>
		<div class="container">
			<div class="row">
				<div class="span12">
					<hr/>
				</div>
				<div class="span4">
					<p>
<?php
if(isset($twitterText) && $twitterText != ""){
?>

						<a href="https://twitter.com/share" class="twitter-share-button" data-text="<?php echo htmlentities($twitterText) ?>">Tweet</a>
						<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>

<?php
}
?>
					</p>
					<p>
                        We used:
                        <br/>
                        <a href="http://sigmajs.org/">Sigma.js</a>,
                        <a href="http://dominojs.org/">Domino.js</a>,
                        <a href="https://github.com/eligrey/FileSaver.js/">FileSaver.js</a>,
                        <a href="http://twitter.github.com/bootstrap/">Bootstrap</a>,
                        <a href="http://jquery.com/">jQuery</a>,
                        <a href="http://modernizr.com/">Modernizr</a>,
                        <a href="http://www.initializr.com/">Initializr</a>
                    </p>
				
				</div>
				<div class="span4">
                    <p>Related tools:</p>
                    <strong><a href="https://tools.medialab.sciences-po.fr/table2net/">Table2Net</a></strong>
                    <p>
                        If you want to get the citation network from the table with the DOI, you can use Table2Net in "citation" mode :)
                    </p>
					<p>See also our other tools at <strong><a href="http://tools.medialab.sciences-po.fr">Médialab Tools</a></strong>!</p>
					<strong><a href="http://www.sebastian-grauwin.com/?page_id=492">BiblioTools</a></strong>
                    <p>
                        BiblioTools was developed by <strong>Sebastian Grauwin</strong> for a similar purpose. It is dedicated to getting networks from Web of Science, and can deal a large mass of data.
                    </p>
                    <strong><a href="http://gephi.org/">Gephi</a></strong>
                    <p>
                        We recommand to use Gephi for spatializing networks. It is more efficient than this website. Check its <a href="http://gephi.org/users/">tutorials</a>!
                    </p>
				</div>
				<div class="span4">
					<div style="text-align:right">
						<a href="http://medialab.sciences-po.fr"><img src="res/logosp_fonce.png"/></a>
						<p class="muted">
							Developed by Mathieu Jacomy
							<br/>
							at the <a href="http://medialab.sciences-po.fr">Sciences-Po Medialab</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	</footer>
