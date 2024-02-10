# duplicate-line(s) / Add next occurence

- Select next occurrence and all occurences updated to work on every selection (if no selection word at cursor position)
- new feature to show number of occurences on selection in status bar (settings color size)
Remember: All features can be switched on/off in settings
[LastFeaturesDemo](https://youtu.be/gJmA36TX7GU)
  
this plugin was at first a simple plugin to duplicate lines up and down  
then I added more options. Some options were greatly inspired by obsidian-tweaks. But I fixed a lot of bugs.  
I tried to make some pull request on this repo but no answer. But thanks to him for many things.  
  
All commands (can be disabled in settings):  
Duplicate Line Down, (recommanded shortcut shift alt ↓)  
Duplicate Line Up, (recommanded shortcut shift alt ↑)  
Duplicate Selection Down, (recommanded shortcut ctrl shift ↓)  
Duplicate Selection Up, (recommanded shortcut ctrl shift ↑)  
Duplicate Selection Right, (recommanded shortcut ctrl shift →)  
Move Right, (recommanded shortcut alt →)  
Move Left, (recommanded shortcut alt ←)  
Add next occurence", (ctrl D)  
Select all occurences, (ctrl shift L)  
Duplicate Selection Right/Line Down (feature request). When no selection duplicate line down, when selection duplicate right.  
  
Selection can be multiline and multicursors  
if no selection the word before or under cursor is selected, when using selection operations  
if no selection, the whole line is used, when using duplicate operations. if selection multiline then duplicate   multiline... it's quite intuitive, make some tries  
  
All commands can be enabled/disabled in settings.  
  
![previous demo](duplicate_line_demo.gif)


## developpement
(do "npm start" at first or a npm i)
-   `npm start` = npm install + npm run dev
-   `npm run bacp` = npm run build + git add + commit (prompt to enter message) + push
-   `npm run acp` = git add + commit (prompt to enter message) + push
-   `npm run version` = prompt to ask what version (patch(1), minor(2), major(3) or manual entering a version e.g 1.2.0 ). git add commit push on manifest, package, versions
-   `npm run release`= publish a release on github with the actual version and prompt for the release message (multiline inserting some \n). you can overwrite an existing release (after confirmation)
-   `npm run test` = npm run build and then export main.js manifest & styles.css(optional) to a target vault. so you can directly test your plugin on another vault as with Brat.Prompts are guiding you. overwritting files if exists in target.

-   Function **"Console"** with a capital C. All Console.log/debug are automatically switched OFF on production after a npm run build, and ON on developpement after a npm start or run dev