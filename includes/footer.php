	<footer>
		<div class="container">
			<div class="row">
				<div class="span12">
					<hr/>
				</div>
				<div class="span3">
<?php
if(isset($twitterText) && $twitterText != ""){
?>

					<a href="https://twitter.com/share" class="twitter-share-button" data-text="<?php echo htmlentities($twitterText) ?>">Tweet</a>
					<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>

<?php
}
?>
					<!-- [WORK IN PROGRESS] -->
				
				</div>
				<div class="span3">
					<!-- Navigation
					<li>
						<a href="x.php">
							x
						</a>
					</li> -->
				</div>
				<div class="span3">
					
				</div>
				<div class="span3">
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
