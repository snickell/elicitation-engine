The NearZero elicitation engine is a **web app for creating and hosting scientific surveys**.

![Screenshot of Elicitation Authoring Interface](https://nearzero.github.io/elicitation-engine/images/screenshot.png)

- Easy to setup, author and launch surveys targeted toward scientists and other experts
- Includes a visual+web-based authoring interface which makes it easy for collaborators to design the survey
- Includes more than a dozen widgets designed to help you frame scientific queries
- Pop-down definitions allow concise on-screen questions with progressive disclosure of detail as needed
- Custom scripting allows complex interactions
- Easy to implement new widgets for any web developer if you have a custom question type
- Authoring interface is built in javascript and runs in-browser, for fast responsive editing
- Thoughtfully developed over several years in response to the practical needs of scientists at [Near Zero](http://www.nearzero.org)

##Builtin Widgets
![Available Widgets](https://nearzero.github.io/elicitation-engine/images/widgets.png)

## Try it out in about 5 minutes:
[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)

1. Create a Microsoft account if you don't already have one: https://account.microsoft.com/
2. Sign up for Windows Azure if you haven't already - usually a free trial: https://azure.microsoft.com
3. Deploy an Elicitation Engine by clicking: [![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)
   * Specify a real username (i.e *not* 'admin') for the new server and a **strong password or the deploy will fail**.
   * The deploy will take a couple minutes to create the new web server and sql database.
5. Now find the URL of your new Elicitation Engine web server:
   * After the deploy completes, click "Manage your resources" to open the Windows Azure Portal.
   * Find the ElicitationEngine-######### App Service in the right hand list and click it to open
   * On the right hand side near the top, find the "URL" and open it to access your elicitation-engine. URL should be something like http://elicitationengine-#########.azurewebsites.net
6. Login with your elicitation admin password, and starting creating elicitations!
   * See http://wiki.nearzero.org/elicitation-authoring for some docs and advice on elicitation authoring
   * The default configuration should cost about $20/mo and uses small servers. This should be OK for many elicitations, but you might want to "Scale Up" both the "App Service Plan" and "SQL Database" to the next Azure hostingplan level before you run the elicitation, esp. if consulting more than a hundred experts.