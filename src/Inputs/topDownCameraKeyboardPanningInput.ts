import {ArcRotateCamera, Camera, CameraInputTypes, ICameraInput, KeyboardEventTypes, KeyboardInfo, Nullable, Observer, Scene, Tools, Engine} from "@babylonjs/core";

export class TopDownCameraKeyboardPanningInput implements ICameraInput<ArcRotateCamera> {

    public camera!: ArcRotateCamera;

    public keysUp = [38, 90];
    public keysLeft = [37, 81];
    public keysDown = [40, 83];
    public keysRight = [39, 68];
    
    public panningSensibility: number = 50.0;

    public useAltToZoom: boolean = true;
    public zoomingSensibility: number = 25.0;
  
    private _keys = new Array<number>();
    private _altPressed!: boolean;
    private _onCanvasBlurObserver!: Nullable<Observer<Engine>>;
    private _onKeyboardObserver!: Nullable<Observer<KeyboardInfo>>;
    private _engine!: Engine;
    private _scene!: Scene;


    /**
     * Gets the class name of the current input.
     * @returns the class name
     */
    public getClassName(): string {
        return "TopDownCameraKeyboardPanningInput";
    }

    /**
     * Get the friendly name associated with the input class.
     * @returns the input friendly name
     */
    public getSimpleName(): string {
        return "keyboardPanning";
    }
    

    //this function must activate your input, even if your input does not need a DOM element
    public attachControl(noPreventDefault?: boolean): void {
        // was there a second variable defined?
        // eslint-disable-next-line prefer-rest-params
        noPreventDefault = Tools.BackCompatCameraNoPreventDefault(arguments);

        if (this._onCanvasBlurObserver) {
            return;
        }

        this._scene = this.camera.getScene();
        this._engine = this._scene.getEngine();

        this._onCanvasBlurObserver = this._engine.onCanvasBlurObservable.add(() => {
            this._keys = [];
        });

        this._onKeyboardObserver = this._scene.onKeyboardObservable.add((info) => {
            const evt = info.event;
            if (!evt.metaKey) {
                if (info.type === KeyboardEventTypes.KEYDOWN) {
                    this._altPressed = evt.altKey;
                    if (
                        this.keysUp.indexOf(evt.keyCode) !== -1 ||
                        this.keysDown.indexOf(evt.keyCode) !== -1 ||
                        this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                        this.keysRight.indexOf(evt.keyCode) !== -1
                    ) {
                        const index = this._keys.indexOf(evt.keyCode);

                        if (index === -1) {
                            this._keys.push(evt.keyCode);
                        }

                        if (evt.preventDefault) {
                            if (!noPreventDefault) {
                                evt.preventDefault();
                            }
                        }
                    }
                } else {
                    if (
                        this.keysUp.indexOf(evt.keyCode) !== -1 ||
                        this.keysDown.indexOf(evt.keyCode) !== -1 ||
                        this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                        this.keysRight.indexOf(evt.keyCode) !== -1
                    ) {
                        const index = this._keys.indexOf(evt.keyCode);

                        if (index >= 0) {
                            this._keys.splice(index, 1);
                        }

                        if (evt.preventDefault) {
                            if (!noPreventDefault) {
                                evt.preventDefault();
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Detach the current controls from the specified dom element.
     */
    public detachControl(): void {
        if (this._scene) {
            if (this._onKeyboardObserver) {
                this._scene.onKeyboardObservable.remove(this._onKeyboardObserver);
            }
            if (this._onCanvasBlurObserver) {
                this._engine.onCanvasBlurObservable.remove(this._onCanvasBlurObserver);
            }
            this._onKeyboardObserver = null;
            this._onCanvasBlurObserver = null;
        }

        this._keys = [];
    }

    /**
     * Update the current camera state depending on the inputs that have been used this frame.
     * This is a dynamically created lambda to avoid the performance penalty of looping for inputs in the render loop.
     */
    public checkInputs(): void {
        if (this._onKeyboardObserver) {
            const camera = this.camera;

            for (let index = 0; index < this._keys.length; index++) {
                const keyCode = this._keys[index];
                
                // Up
                if (this.keysUp.indexOf(keyCode) !== -1) {
                    if (this._altPressed && this.useAltToZoom) {
                        camera.inertialRadiusOffset += 1 / this.zoomingSensibility;
                    } 
                    else {
                        camera.inertialPanningY += 1 / this.panningSensibility;
                    }
                }

                // Left
                else if (this.keysLeft.indexOf(keyCode) !== -1) {
                    camera.inertialPanningX -= 1 / this.panningSensibility;
                } 
                
                // Down
                else if (this.keysDown.indexOf(keyCode) !== -1) {
                    if (this._altPressed && this.useAltToZoom) {
                        camera.inertialRadiusOffset -= 1 / this.zoomingSensibility;
                    } 
                    else {
                        camera.inertialPanningY -= 1 / this.panningSensibility;
                    }
                }

                // Right
                else if (this.keysRight.indexOf(keyCode) !== -1) {
                        camera.inertialPanningX += 1 / this.panningSensibility;
                }

            }
        }
    }
}

