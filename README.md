# p5.js VSCode Template

## What's In This Project
* p5.js environment:
  * index.html
  * sketch.js
 * Dev Container configuration:
   * use command "Dev Container: Reopen in Container"
   * (use **shift-command-P** to open command bar or click green button in lower-left corner of VSCode)
 * Linting configuration:
   * Configured to run eslint with the p5js plugin
   * Includes the VSCode eslint plugin
   * Uses npm's package.json
  
## Running / Previewing the p5.js Project
Use the command **"Live Preview: Start Server"**. Use **shift-command-P** to open command bar then begin typing any of the words in the command name.

Alternatively, go to the Explorer tab to see all the files, then right-click on **index.html** and select "**Show Preview**".

When it opens the preview, it starts up a server. You don't have to use the built-i preview panel; you can connect to that server in your regular browser by typing in the URL `http://127.0.0.1:3000/`

You can stop the server by clicking the icon in the bottom-right of VSCode, which brings up a shortcut to the commands "Live Preview: Stop Server", or enter that command directly in the command bar.

## Writing Code
As with any p5.js project, use **sketch.js** to write your code. 

You may add additional JavaScript files, but they'll need to be added to the **index.html** file in order to be loaded.

To load additional code files, add a line like this to **index.html** ABOVE the sketch.js line:

```html
<script src="YOURNEWFILE.js"></script>
```

