import { Scene, Vector3, Camera, ArcRotateCamera, UniversalCamera, FreeCameraMouseWheelInput, ArcRotateCameraKeyboardMoveInput, ArcRotateCameraMouseWheelInput } from "@babylonjs/core";

import { ControllersEnum } from "./app";

import { TopDownCameraKeyboardPanningInput } from "./Inputs/topDownCameraKeyboardPanningInput";
import { TopDownCameraMousePanningInput } from "./Inputs/topDownCameraMousePanningInput";

export const firstPersonCameraSettings = {
    height: 1.705,
    mouseWheelSpeed: 0.04,
    speed: 0.1,
    inertia: 0.94,
    fov: 0.91
}

export const topDownCameraSettings = {
    initialHeight: 12,
    wheelPrecision: 15,
    inertia: 0.92,
    fov: 0.75,
    lowerRadiusLimit: 4,
    upperRadiusLimit: 25,
    panningDistanceLimit: 2, // Get this value from ./environment later, unused for now - panning disabled
    targetHeight: firstPersonCameraSettings.height,
    angularSensibility: 4000,
    keyboardAngularSpeed: 0.002,
    keyboardZoomingSensibility: 50,
}

export const twoDCameraSettings = {

}

export class Controller {

    public name: string;
    private _scene: Scene;
    public camera!: UniversalCamera | ArcRotateCamera;

    constructor(controllerName: ControllersEnum, scene: Scene) {

        this.name = controllerName;
        this._scene = scene

        this._setupController();
    }
    
    private async _setupController() {
        this._setupCamera();
    }

    private async _setupCamera() {
        if (this.name == ControllersEnum.firstPerson) {
            this.camera = new UniversalCamera(this.name + "Camera", new Vector3(0, firstPersonCameraSettings.height, 0), this._scene)

            this.camera.ellipsoid = new Vector3(2, firstPersonCameraSettings.height/2, 2)
            this.camera.checkCollisions = true;

            // Add and configure mouse wheel input
            this.camera.inputs.addMouseWheel();
            let mouseWheelInput = <FreeCameraMouseWheelInput> this.camera.inputs.attached.mousewheel
            mouseWheelInput.wheelPrecisionX = firstPersonCameraSettings.mouseWheelSpeed
            mouseWheelInput.wheelPrecisionY = firstPersonCameraSettings.mouseWheelSpeed
            mouseWheelInput.wheelPrecisionZ = firstPersonCameraSettings.mouseWheelSpeed

            // Configure camera settings
            this.camera.invertRotation = true;
            this.camera.inertia = firstPersonCameraSettings.inertia;
            this.camera.fov = firstPersonCameraSettings.fov;
            this.camera.speed = firstPersonCameraSettings.speed;

        }
        else if (this.name == ControllersEnum.topDown) {
            this.camera = new ArcRotateCamera(this.name + "Camera", Math.PI*1.5, 0.5, topDownCameraSettings.initialHeight, new Vector3(0, topDownCameraSettings.targetHeight, 0), this._scene)

            // Base settings
            this.camera.upperBetaLimit = (Math.PI * 0.5) - 0.1
            this.camera.lowerRadiusLimit = topDownCameraSettings.lowerRadiusLimit;
            this.camera.upperRadiusLimit = topDownCameraSettings.upperRadiusLimit;
            this.camera.fov = topDownCameraSettings.fov;
            this.camera.inertia = topDownCameraSettings.inertia;
            
            // Disable Panning
            this.camera.panningAxis = Vector3.Zero();
            // this.camera.mapPanning = true;
            // this.camera.panningDistanceLimit = topDownCameraSettings.panningDistanceLimit;
            
            // Mouse input settings
            this.camera.angularSensibilityX = topDownCameraSettings.angularSensibility;
            this.camera.angularSensibilityY = topDownCameraSettings.angularSensibility;
            this.camera.wheelPrecision = topDownCameraSettings.wheelPrecision;
            
            // Keyboard input settings
            let keyboardInput = <ArcRotateCameraKeyboardMoveInput> this.camera.inputs.attached.keyboard;
            keyboardInput.angularSpeed = topDownCameraSettings.keyboardAngularSpeed;
            keyboardInput.keysReset = [];
            keyboardInput.zoomingSensibility = topDownCameraSettings.keyboardZoomingSensibility;

        }
        else if (this.name == ControllersEnum.twoD) {
            this.camera = new ArcRotateCamera(this.name + "Camera", Math.PI * 1.5, 0, 10, Vector3.Zero(), this._scene, false)
            this.camera.lowerBetaLimit = 0
            
            this.camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
            
            // Remove all inputs
            for (let attachedInput in this.camera.inputs.attached) {
                this.camera.inputs.removeByType(this.camera.inputs.attached[attachedInput].getClassName());
            }

            this.camera.inputs.add(new TopDownCameraKeyboardPanningInput())
            this.camera.inputs.add(new TopDownCameraMousePanningInput())

            this.camera.orthoTop = 10;

        }
        else if (this.name == ControllersEnum.debug) {
            this.camera = new UniversalCamera(this.name + "Camera", Vector3.Zero(), this._scene)
        }
    }

    public activateController() {
        console.log("Activating " + this.name);
        console.log(this.camera.inputs.attached)

        this.camera.attachControl();
    }

    public deactivateController() {
        this.camera.detachControl()
    }

}