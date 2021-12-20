#!/bin/sh

GOOS=js GOARCH=wasm go build -o ../public/scripts/main.wasm
echo "Done"
