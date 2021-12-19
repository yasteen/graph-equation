$Env:GOOS = "js"; $Env:GOARCH = "wasm"; go build -o ..\public\scripts\main.wasm
Remove-Item Env:\GOOS
Remove-Item Env:\GOARCH