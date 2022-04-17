package main

import (
	"syscall/js"

	"github.com/yasteen/go-parse/types/mathgroups/real"
)

func graph(this js.Value, args []js.Value) interface{} {
	expression := args[0].String()
	start := args[1].Float()
	step := args[2].Float()
	end := args[3].Float()
	variableName := args[4].String()
	ans, err := real.MapValues(expression, *real.NewRealInterval(start, step, end), variableName)
	if err != nil {
		alert := js.Global().Get("alert")
		alert.Invoke("Error: " + err.Error())
	}
	return ans
}

func main() {
	c := make(chan int)
	js.Global().Set("graph", js.FuncOf(graph))
	<-c
}
