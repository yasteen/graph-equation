#!/bin/sh

go mod tidy
GOOS=js GOARCH=wasm go build -o ../public/scripts/main.wasm
echo "Finished building Go WASM module."
