package main

import (
	"fmt"
	"reflect"
)

type analogCamera struct {
	picture string
}

func (c *analogCamera) Snapshot(pic string) {
	c.picture = pic
}

func NewAnalogCamera() PrintableCamera {
	return &analogCamera{}
}

type Camera interface {
	Snapshot(pic string)
}

type Lens[C Camera] interface {
	Transform(camera C, pic string) error
}

type CameraWithLens[C Camera, L Lens[Camera]] interface {
	Camera
	PrepareLens(lens L) error
	Attach() error
	Detach() error
}

type zoomLens struct {
}

func (l *zoomLens) Transform(camera Camera, pic string) error {
	camera.Snapshot(fmt.Sprintf("magnified 2x! %s", pic))
	return nil
}

func NewZoomLens() Lens[Camera] {
	return &zoomLens{}
}

type GenericCameraWithLens[C Camera, L Lens[Camera]] struct {
	camera         C
	lens           L
	isLensAttached bool
}

func (c *GenericCameraWithLens[C, L]) PrepareLens(lens L) error {
	c.lens = lens
	return nil
}

func (c *GenericCameraWithLens[C, L]) Attach() error {
	if any(c.lens) == nil {
		return fmt.Errorf("lens not installed")
	}
	c.isLensAttached = true
	return nil
}

func (c *GenericCameraWithLens[C, L]) Detach() error {
	if any(c.lens) == nil {
		return fmt.Errorf("lens not installed")
	}
	c.isLensAttached = false
	return nil
}

func (c *GenericCameraWithLens[C, L]) Snapshot(pic string) {
	if !c.isLensAttached {
		c.camera.Snapshot(pic)
		return
	}
	c.lens.Transform(c.camera, pic)
}

func NewCameraWithLens[C Camera, L Lens[Camera]](camera C, newLens func() L) CameraWithLens[C, L] {
	internalCamera := any(camera).(C)
	genericCamera := &GenericCameraWithLens[C, L]{
		camera: internalCamera,
	}
	genericCamera.PrepareLens(newLens())
	return genericCamera
}

type digitalCamera struct {
	picture string
}

func (c *digitalCamera) Snapshot(pic string) {
	c.picture = pic
}

func NewDigitalCamera() PreviewableCamera {
	return &digitalCamera{}
}

type PrintableCamera interface {
	Camera
	Print() string
}

func (c *analogCamera) Print() string {
	return c.picture
}

type PreviewableCamera interface {
	Camera
	Preview() string
}

func (c *digitalCamera) Preview() string {
	return c.picture
}

type PrintableCameraWithLens struct {
	GenericCameraWithLens[PrintableCamera, Lens[Camera]]
}

func (c *PrintableCameraWithLens) Print() string {
	return c.GenericCameraWithLens.camera.Print()
}

type PreviewableCameraWithLens struct {
	GenericCameraWithLens[PreviewableCamera, Lens[Camera]]
}

func (c *PreviewableCameraWithLens) Preview() string {
	return c.GenericCameraWithLens.camera.Preview()
}

func NewCameraWithLensAsType[Target any, C Camera, L Lens[Camera]](camera C, newLens func() L) *Target {
	genericCamera, ok := NewCameraWithLens(camera, newLens).(*GenericCameraWithLens[C, L])
	if !ok {
		panic("failed to create generic camera with lens")
	}
	// direct assertion if available
	if v, ok := any(genericCamera).(*Target); ok {
		return v
	}
	// embed the struct to target type
	// get the type info of the target type
	targetType := reflect.TypeOf((*Target)(nil)).Elem()
	if targetType.Kind() != reflect.Struct {
		panic("target type must be a struct")
	}
	if targetType.NumField() != 1 {
		panic("target type must have exactly one field")
	}
	field := targetType.Field(0)
	if !field.Anonymous {
		panic("target type must have an anonymous field")
	}
	if field.Type != reflect.TypeOf(*genericCamera) {
		panic("target type must have a field of type GenericCameraWithLens")
	}
	vPtr := reflect.New(targetType)
	vPtr.Elem().Field(0).Set(reflect.ValueOf(*genericCamera))
	return vPtr.Interface().(*Target)
}

func main() {
	c := &analogCamera{}
	c.Snapshot("hello") // send command Snapshot with arguments "hello" to object c.

	myCamera := NewCameraWithLens[Camera](NewAnalogCamera(), NewZoomLens)
	myCamera.Attach()
	myCamera.Snapshot("hello")

	// assume that we have this generic object
	genericObject := &GenericCameraWithLens[PrintableCamera, Lens[Camera]]{
		camera: &analogCamera{},
	}
	// we can reassign it into different types, if the fields are exactly the same
	genericObjectWithExtendedMethod := &PrintableCameraWithLens{
		*genericObject,
	}
	genericObjectWithExtendedMethod.Snapshot("hello")
	if genericObjectWithExtendedMethod.Print() != "hello" {
		panic("generic object with extended method failed")
	}

	myPrintableCamera := NewCameraWithLensAsType[PrintableCameraWithLens](NewAnalogCamera(), NewZoomLens)
	myPrintableCamera.Attach()
	myPrintableCamera.Snapshot("hello")
	fmt.Println(myPrintableCamera.Print())

	var myTestCamera PrintableCamera
	// with zoom lens
	if cam := NewCameraWithLensAsType[PrintableCameraWithLens](NewAnalogCamera(), NewZoomLens); cam != nil {
		cam.Attach()
		myTestCamera = cam
	}
	myTestCamera.Snapshot("my printable camera with lens")
	fmt.Println(myTestCamera.Print())
	// no lens
	myTestCamera = NewAnalogCamera()
	myTestCamera.Snapshot("my printable camera without lens")
	fmt.Println(myTestCamera.Print())

	var myPreviewCamera PreviewableCamera
	// with zoom lens
	if cam := NewCameraWithLensAsType[PreviewableCameraWithLens](NewDigitalCamera(), NewZoomLens); cam != nil {
		cam.Attach()
		myPreviewCamera = cam
	}
	// no lens
	myPreviewCamera.Snapshot("my preview camera with lens")
	fmt.Println(myPreviewCamera.Preview())
	myPreviewCamera = NewDigitalCamera()
	myPreviewCamera.Snapshot("my preview camera without lens")
	fmt.Println(myPreviewCamera.Preview())
}
