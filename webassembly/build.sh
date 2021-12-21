#!/bin/sh

GOOS=js GOARCH=wasm go build -o ../public/scripts/main.wasm
echo "Finished building Go WASM module."
