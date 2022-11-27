# Sinfar Scripters Extension

Sinfar Scripters Extension is a Visual Studio Code extension which enables working on scripts for the Sinfar NWN server using VS Code.

The extension provides a virtual file system connected back to the Sinfar Dev server so all files are opened from and saved back to the server. Nothing is stored locally.
NWScript Language Server functionality is provided by the a modified version of Philippe Chab's NWScript: EE Language Server (https://github.com/PhilippeChab/nwscript-ee-language-server)

## Features

- Enhanced syntax highlighting
- Completion
- Hover information
- Goto definition
- Formatting
- Range formatting
- Signature help
- Diagnostics

### Formatting

[clang-format](https://clang.llvm.org/docs/ClangFormat.html).

## Usage

After installing the extension 
1) Close all open folders.
2) Press `F1` and select `Create Sinfar Workspace` from the commands menu. The extension will setup a new workspace called Sinfar.
3) Press `F1` again and this time select `Login to Sinfar`. This can take a few seconds depending on how many ERF you have access to.
4) Once it completes expand the Sinfar folder and you will see all the ERF and scripts underneath

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

Notes:

- Diagnostics are not currently working

### Syntax highligthing

I personally use the [One Dark Pro](https://marketplace.visualstudio.com/items?itemName=zhuangtongfa.Material-theme) theme . See VS Code [documentation](https://code.visualstudio.com/docs/getstarted/themes) if you wish to customize the highlighting further.

## Building and running

- Install NodeJS from https://nodejs.org/en/.
- Invoke `npm install -g yarn vsce` which will install Yarn, a dependency manager, and vsce, a VS Code packaging library.
- In the project root directory, invoke `yarn install` which will install all dependencies using Yarn.
- In the project root directory, invoke `vsce package` which will produce a .vsix file.
- To install, in VS Code on the extension pane, click on the three dots at the top right then select `Install From VSIX` and navigate to the package you just produced.

## Attaching the debugger

- Build and successfully run the extension
- Invoke `yarn webpack`
- Invoke `yarn run compile`
- You may have to add a `waitForDebugger()` statement somewhere near the server startup (otherwise the additional processes the server spawns seem to confuse the debugger and it won't attach properly)
- Use `Launch the Client` command
- Use `Attach to Server`

### Generating the language library definitions

Replace `server/scripts/nwscript.nss` by its new version and execute `yarn run generate-lib-defs` in the server root directory.

## Issues

Please report any issues on the github [repository](https://github.com/nelak2/nwscript-sinfar-language-server).
