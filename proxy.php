<?php
// Some inspiration from: https://github.com/cowboy/php-simple-proxy

// Check that this is coming from the same domain
//$ref = $_SERVER['HTTP_REFERER'];
//$refData = parse_url($ref);
//if($refData['host'] !== 'play.fm.to.it') {
//  // Stop execution
//  die("Hotlinking not permitted, install proxy on your own server and use your own app key.");
//}

// Check that this is an xmlhttprequest
//if(empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest') {
//  die("No XMLHTTP request detected");
//}


// Get the query string and append it to the base url to create the request
$baseUrl = "http://comtrade.un.org/api/get";
$requestUrl = $baseUrl.'?'.$_SERVER['QUERY_STRING'];


$curl = curl_init();                                      // Initialize the curl request
curl_setopt_array($curl, array(
  CURLOPT_CUSTOMREQUEST => "GET",
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_URL => $requestUrl,
  CURLOPT_HEADER => true,
  CURLOPT_USERAGENT => isset($_GET['user_agent']) ? $_GET['user_agent'] : $_SERVER['HTTP_USER_AGENT'],
  CURLOPT_HTTPHEADER => array(
    'Content-Type: text/csv; charset=UTF-8',
    'X-Accept: */*'
  )));

// run the curl
list($header, $contents) = preg_split( '/([\r\n][\r\n])\\1/', curl_exec( $curl ), 2 );
$status = curl_getinfo( $curl );
curl_close($curl);                                        // Close the request

// Split header text into an array.
$header_text = preg_split( '/[\r\n]+/', $header );

foreach ( $header_text as $header ) {                     // Propagate headers to response.
  if ( preg_match( '/^(?:Content-Type|Content-Language|Set-Cookie|Cache-Control|Content-Length|Expires|X-)/i', $header ) ) {
    header( $header );
  }
}

//header("Access-Control-Allow-Origin: *");                 // Uncomment for development

print $contents;

?>
