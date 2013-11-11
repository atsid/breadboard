#  Node.js clickstart

This clickstart demonstrates a basic hello world node.js app on CloudBees with continuous deployment.
Jenkins runs tests via npm. 

package.json is used to specify what packages are needed - main.js is the default server app
(you can set main_js via bees config:set to override it to something else)

<a href="https://grandcentral.cloudbees.com/?CB_clickstart=https://raw.github.com/CloudBees-community/nodejs-clickstart/master/clickstart.json"><img src="https://d3ko533tu1ozfq.cloudfront.net/clickstart/deployInstantly.png"/></a>


If you don't have a cloudbees account:
  <div>Sign in with GitHub:<div><button onClick="javascript:window.location='https://grandcentral.cloudbees.com/authenticate/start?provider=github&login_redirect=/';"><img src="https://grandcentral.cloudbees.com/images/github-icon_40.png" /></button>




# To run manually locally


0. Install node.js
1. Clone this repo
2. node app/main.js

# To deploy manually to CloudBees

1. cd app
2. zip -r ../app.zip
3. bees app:deploy -t nodejs ../app.zip


# The node.js clickstack
See here if you want to change how it work: https://github.com/CloudBees-community/node-clickstack
The node-clickstack makes this possible - if you want to tweak how the node.js container works
fork that repo, change it, and use it for the -RPLUGIN.SRC.nodejs url above.

Otherwise - fork this ! 


