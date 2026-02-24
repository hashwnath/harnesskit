# demo.tape — run with: vhs demo.tape
Output demo.gif
Set FontSize 14
Set Width 900
Set Height 500
Set Theme "Catppuccin Mocha"

Type "mkdir my-project && cd my-project && npm init -y" Enter
Sleep 2s
Type "harnesskit init --yes" Enter
Sleep 4s
Sleep 8s
Type "harnesskit doctor ." Enter
Sleep 4s
Type "harnesskit enforce ." Enter
Sleep 4s
Type "head -n 20 docs/BRAIN.html" Enter
Sleep 4s
