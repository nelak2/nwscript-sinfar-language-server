# Sinfar NWN Toolset Replacement

The Sinfar NWN Toolset Replacement is a Visual Studio Code extension which is intended to replace the NWN toolset for most things and the Sinfar Dev website completely.

Actual editing of areas as per the Bioware NWN Toolset is not yet implemented but is planned once support for reading and writing all NWN resource files is fully implemented and tested.

**Caution: Currently most core features are implemented but not fully tested. There is a good chance of corrupting your NWN resources!!**

## Features

- Script editor leveraging VSCode's built in functionality and full language server with code completion based on a modified version of Philippe Chab's NWScript: EE Language Server (https://github.com/PhilippeChab/nwscript-ee-language-server).
- Viewing, editing and creating most NWN resources similar to the Sinfar Dev website
- All files are located remotely on the server so a single module can be worked on by an unlimited number of people without any need for manual merging of ERF/MODs
- Login/authentication with the Sinfar Web API

## Usage of NWScript Editor:

After installing the extension

1. Close all open folders.
2. Press `F1` and select `Create Sinfar Workspace` from the commands menu. The extension will setup a new workspace called Sinfar.
3. Press `F1` again and this time select `Login to Sinfar`. This can take a few seconds depending on how many ERF you have access to.
4. Once it completes expand the Sinfar folder and you will see all the ERF and scripts underneath

- You can click on any file and it will open from the server. To refresh a file just close it's tab and reopen it.
- To save just go `File->Save` or `CTRL+S`
- You can download individual scripts or entire ERF's by right clicking on them and going to `Download`
- You can also open the ERF or script in your default browser by right clicking and picking `Open in Browser`
- If the ERF folder in VS Code is no longer in sync with what is on the server (files were added/removed on the website) simply right click on the ERF and click `Refresh ERF`
- Functions in #includes will only be suggested by the code completions if they have a prototype definition. For example:

```
void myFunction(int param); // this is a function prototype
void myFunction(int param)
{
  // code here...
}
```

## Building and running

- Install NodeJS from https://nodejs.org/en/.
- Invoke `npm install -g yarn vsce` which will install Yarn, a dependency manager, and vsce, a VS Code packaging library.
- In the project root directory, invoke `yarn install` which will install all dependencies using Yarn.
- In the project root directory, invoke `vsce package` which will produce a .vsix file.
- To install, in VS Code on the extension pane, click on the three dots at the top right then select `Install From VSIX` and navigate to the package you just produced.

## Issues, Feedback, Feature Requests

Please report any issues, feedback, or feature requests on the github [repository](https://github.com/nelak2/nwscript-sinfar-language-server).

## Credit

- Philippe Chab and the contributors of the NWScript: EE Language Server for providing the core language parsing functionality (https://github.com/PhilippeChab/nwscript-ee-language-server)
- Icons from https://www.flaticon.com/ by the following authors:
  - Freepik (https://www.freepik.com)
  - pongsakornRed (https://www.flaticon.com/authors/pongsakornred)
  - xnimrodx (https://www.flaticon.com/authors/xnimrodx)
  - wanicon (https://www.flaticon.com/authors/wanicon)
  - Smashicons (https://www.flaticon.com/authors/smashicons)
  - Pixel perfect (https://www.flaticon.com/authors/pixel-perfect)
