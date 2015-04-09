<?php
  // THIS PAGE HAS THE ONLY PURPOSE OF GENERATING OPEN GRAPH TAGS FOR FACEBOOK TO READ WHEN CONTENT IS SHARED

  // Base URL
  $baseUrl = "http://play.fm.to.it/trademap/";

  // Facebook tags
  $title        = isset($_GET['title']) ? $_GET['title'] : "This is a title";
  $type         = "website";
  $image        = $baseUrl."img/fbThumb.png";
  $url          = $baseUrl."fb.php".$_SERVER['QUERY_STRING'];
  $description  = "This is a simple test";

?><!DOCTYPE html>
<html lang="">
<head>
  <meta property="og:title"       content="<?php echo $title; ?>" />
  <meta property="og:type"        content="<?php echo $type; ?>" />
  <meta property="og:image"       content="<?php echo $image; ?>" />
  <meta property="og:url"         content="<?php echo $url; ?>" />
  <meta property="og:description" content="<?php echo $description; ?>" />

  <title>International Trade in Goods by Country and Commodity</title>
<!--  <meta http-equiv="refresh" content="0;URL=index.html">-->
</head>

<body>
  Redirecting you to the <a href="index.html">International Trade in Goods by Country and Commodity application.</a>
</body>
</html>
