//lets load newrelic - if we have it
if (process.env.license) {
  require('newrelic');  
}

// Load the http module to create an http server.
var http = require('http');

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/html"});

  /** this is only used to show what to do next */
  var popover = '<!-- this is used for first time display of clickstart - a template-->\
    <div id="clickstart_content" style="display:none">\
    <p>\
      Congratulations, your <a href="#CS_docUrl"><span>#CS_name</span></a> application is now running.<br />\
      To modify it, <a href="https://grandcentral.cloudbees.com/user/ssh_keys">\
      upload your public key (for git) here</a> if you haven\'t already.\
      <br>Then clone your project:\
    </p>\
    <div class="CB_codeSample">\
      git clone #CS_source #CS_appName<br/>\
          cd #CS_appName<br/>\
          ---- do your magic edits ----<br/>\
          git commit -m "This is now even better"<br/>\
          git push origin master\
    </div>\
    <p>That is it ! This will trigger your build/deploy pipline and publish your change</p>\
    <p>We have set up all the moving parts for you - the management urls can be found on the following urls:</p>\
    <ul>\
      <li><strong>App console:</strong> <a href="#CS_appManageUrl">#CS_appManageUrl</a></li>\
      <li><strong>Jenkins Build System:</strong> <a href="#CS_jenkinsUrl">#CS_jenkinsUrl</a></li>\
      <li><strong>Source repositories:</strong> <a href="#CS_forgeUrl">#CS_forgeUrl</a></li>\
    </ul>\
  </div>\
  <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.4.0/jquery.min.js"></script>\
  <script type="text/javascript" src="https://s3.amazonaws.com/cloudbees-downloads/clickstart/clickstart_intro.js"></script>\
  <!-- end clickstart intro section -->';

  response.end("<html><h1><code>Welcome to Node.js on CloudBees</code></h1>\
    <code>Made with a <a href='https://github.com/CloudBees-community/nodejs-clickstart'>ClickStart</a></code><p>\
    <code>How it <a href='https://github.com/CloudBees-community/node-clickstack'>works</a> (a ClickStack)\
     and <a href='http://developer.CloudBees.com'>docs</a></code><p><p>\
    " + popover + "</html>");
});


server.listen(process.env.PORT);

// Put a friendly message on the terminal
console.log("Node Server running");
