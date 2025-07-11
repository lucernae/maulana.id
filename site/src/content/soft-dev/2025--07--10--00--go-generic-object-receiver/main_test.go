package main_test

import (
	"testing"

	main "github.com/lucernae/go-sandbox"
)

func TestCamera(t *testing.T) {
	c := main.NewAnalogCamera()
	c.Snapshot("hello")
}

func TestGenericCamera(t *testing.T) {
	c := main.NewCameraWithLens[main.Camera](main.NewAnalogCamera(), main.NewZoomLens)
	if c.Attach() != nil {
		t.Error("attach failed")
	}
	c.Snapshot("hello")
}
