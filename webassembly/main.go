package main

import (
	"syscall/js"

	"github.com/yasteen/go-parse/mathgroups/real"
	"github.com/yasteen/go-parse/run"
)

func graph(this js.Value, args []js.Value) interface{} {
	expression := args[0].String()
	start := args[1].Float()
	step := args[2].Float()
	end := args[3].Float()
	variableName := args[4].String()
	ans, err := run.GetRunnableMathGroup(real.Real).MapValues(expression, *real.NewInterval(start, step, end), variableName)
	if err != nil {
		alert := js.Global().Get("alert")
		alert.Invoke("Error: " + err.Error())
	}

	a := []interface{}{}
	for _, val := range ans {
		a = append(a, val)
	}
	return a
}

func main() {
	c := make(chan int)
	js.Global().Set("graph", js.FuncOf(graph))
	<-c
}
