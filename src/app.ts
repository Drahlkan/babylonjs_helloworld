import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, Vector3, Mesh, Color3, Color4, ShadowGenerator, GlowLayer, PointLight, FreeCamera, CubeTexture, Sound, PostProcess, Effect, SceneLoader, Matrix, MeshBuilder, Quaternion, AssetsManager, ArcRotateCamera, HemisphericLight, UniversalCamera, AxesViewer, Camera, TransformNode, PickingInfo, Nullable, AbstractMesh, Texture, StandardMaterial } from "@babylonjs/core";
import {AdvancedDynamicTexture, Button, Control, } from "@babylonjs/gui"

import { Environment } from "./environment";
import { Controller, firstPersonCameraSettings } from "./controller";

export enum ControllersEnum {
    firstPerson = "firstPersonController",
    topDown = "topDownController",
    twoD = "twoDController",
    debug = "debugController"
}

class App {
    // General Entire Application
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _scene: Scene;
    
    // Camera Switch HTML Buttons
    private _twoDCameraButton = <HTMLDivElement> document.getElementById("two-d-camera-button");
    private _threeDCameraButton = <HTMLDivElement> document.getElementById("three-d-camera-button");
    private _subjectiveCameraButton = <HTMLDivElement> document.getElementById("subjective-camera-button");
    
    // Display
    private _environment!: Environment;

    // Camera Controllers
    private _firstPersonController!: Controller;
    private _topDownController!: Controller;
    private _twoDController!: Controller;
    private _debugController!: Controller;

    private _activeController!:Controller;

    // Debugging Settings
    private _allowDebugMode: boolean = true;
    private _isKeyLoggerOn: boolean = true; // For the key logger to work, allowDebugMode has to be true as well

    private _isDebugDisplayOn: boolean = false;
    private _debugAssets?: AxesViewer;

    public selectedMat?: StandardMaterial | null;
    public selectedMesh?: Nullable<AbstractMesh>;
    
    constructor() {

        // Attaches the html canvas element to the app
        this._canvas = <HTMLCanvasElement> document.getElementById("renderCanvas");
        // Attaches engine to canvas
        this._engine = new Engine(this._canvas, true);

        // Enable resizing 
        window.addEventListener('resize', () => {
            this._engine.resize();
        });

        // Empty scene init
        this._scene = new Scene(this._engine);
        
        // Start initialization and main loop
        this._main();
    }

    private async _main(): Promise<void> {

        // Initialize HTML UI elements first, as they are not dependant of the scene.
        this._initUI();
        
        // Initialize scene
        await this._initScene();

        // Initialize debug functionalities if _allowDebugMode
        if (this._allowDebugMode) {
            // Add event for inspector
            this._initInspector();
            // Add event for debug mode
            this._initDebugMode();
        }

        this._scene.registerBeforeRender(() => {
            if (this._activeController.camera == this._firstPersonController.camera) {
                if (this._activeController == this._firstPersonController) {
                    this._activeController.camera.position._y = firstPersonCameraSettings.height;
                }
            } 
            else if (this._activeController.camera == this._twoDController.camera) {
                this._updateOrthoAspectRatio()
            }
        })

        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
    }

    // Initialize HTML UI functionalities
    private async _initUI(): Promise<void> {
        console.log("START - _initUI - START");

        this._initFullscreenToggle();
        this._initResetButton();
        this._initSidePanelToggle();
        this._initCameraButtons();

        console.log("END - _initUI - END");
    }

    // Initialize fullscreen toggle functionality
    private async _initFullscreenToggle(): Promise<void> {
        console.log("START - _initFullscreenToggle - START")

        let toggleFullscreenButton = <HTMLAnchorElement> document.getElementById("toggle-fullscreen-button");
        let toggleFullscreenOn = <HTMLElement> document.getElementById("toggle-fullscreen-on");
        let toggleFullscreenOff = <HTMLElement> document.getElementById("toggle-fullscreen-off");

        toggleFullscreenButton.onclick = function () {
            if (document.fullscreenElement) {
              document.exitFullscreen()
              toggleFullscreenOn.classList.remove("hidden");
              toggleFullscreenOff.classList.add("hidden");
            } else {
              document.documentElement.requestFullscreen();
              toggleFullscreenOn.classList.add("hidden");
              toggleFullscreenOff.classList.remove("hidden");
            }
        }
        console.log("END - _initFullscreenToggle - END")
    }

    // Initialize reset button functionality
    private async _initResetButton(): Promise<void> {
        console.log("START - _initResetButton - START")
        
        let resetButton = <HTMLAnchorElement> document.getElementById("reset-button");
        resetButton.onclick = e => {
            this._initScene();
        }

        console.log("END - _initResetButton - END")
    }

    // Initialize side panel toggle functionality
    private async _initSidePanelToggle(): Promise<void> {

        console.log("START - _initSidePanelToggle - START")

        let toggleSidePanelButton = <HTMLAnchorElement> document.getElementById("toggle-side-panel-button")
        let sidePanel = <HTMLElement> document.getElementById("side-panel")
        toggleSidePanelButton.onclick = function (event) {
            if (toggleSidePanelButton.classList.contains("on")) {
                toggleSidePanelButton.classList.remove("on")
                sidePanel.classList.remove("on")
            } else {
                toggleSidePanelButton.classList.add("on")
                sidePanel.classList.add("on")
            }
        }

        console.log("END - _initSidePanelToggle - END")

    }

    private async _initCameraButtons(): Promise<void>  {
        this._twoDCameraButton.onclick = e => {
            this._changeController(ControllersEnum.twoD, this._twoDCameraButton)
        }

        this._threeDCameraButton.onclick = e => {
            this._changeController(ControllersEnum.topDown, this._threeDCameraButton)
        }

        this._subjectiveCameraButton.onclick = e => {
            this._changeController(ControllersEnum.firstPerson, this._subjectiveCameraButton)
        }
    }

    // Initialize main Scene
    private async _initScene(): Promise<void> {
        console.log("START - _initScene - START");

        
        this._engine.displayLoadingUI();
        
        this._scene.detachControl();
        
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 0, 0, 1);
        scene.collisionsEnabled = true;
        
        let assetsManager = new AssetsManager(scene);

        let meshTask = assetsManager.addMeshTask("logo task", "", "assets/models/ground/", "logo.babylon");

        meshTask.onSuccess = function(task) {

            let test = new TransformNode("test")
            for (let i = 0; i < task.loadedMeshes.length; i++) {
                task.loadedMeshes[i].parent = test;   
            }
            test.position = new Vector3(0,1,2);
        }

        meshTask.onError = function (task, message, exception) {
            console.log(message, exception);
        }

        assetsManager.load();
        
        scene.onPointerDown = (evt, pickInfo) => {
            if (pickInfo.hit) {
                let pickedMesh = <AbstractMesh> pickInfo.pickedMesh;
                if (this.selectedMat) {
                    pickedMesh.material = this.selectedMat;
                }
                else {
                    if (this.selectedMesh) {
                        this.selectedMesh.renderOutline = false;
                    }
                    this.selectedMesh = pickedMesh
                    this.selectedMesh.renderOutline = true;
                }
            }
            else {
                if (this.selectedMesh){
                    this.selectedMesh.renderOutline = false;
                    this.selectedMesh = null;
                }
            }
        }
    

        let light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);
        
        // Waiting for scene to be loaded
        await scene.whenReadyAsync();
        
        // Dispose of previous scene and assign new one
        this._scene.dispose();
        this._scene = scene;

        // this._initGUI();

        // Controllers Setup
        await this._initControllers();

        this._changeController(ControllersEnum.firstPerson, this._subjectiveCameraButton)
        
        await this._initEnvironment();

        this._initSidePanel();

        this._engine.hideLoadingUI();

        console.log("END - _initScene - END")
    }

    private async _initSidePanel() {
        for (let i = 0; i < this._environment.groundTextures.length; i++) {
            const groundTexture = this._environment.groundTextures[i];
            const name = groundTexture.name;
            const src = groundTexture.src;
            const mat = groundTexture.data;

            this._createSidePanelItem(name, src, mat)
        }
        for (let i = 0; i < this._environment.wallTextures.length; i++) {
            const wallTexture = this._environment.wallTextures[i];
            const name = wallTexture.name;
            const src = wallTexture.src;
            const mat = wallTexture.data;

            this._createSidePanelItem(name, src, mat)
        }
    }

    private async _createSidePanelItem(name:string, src:string, mat:StandardMaterial) {
        const itemList = <HTMLElement> document.getElementById("item-list")

        const item = document.createElement("li");
        item.classList.add("item-category-tile");
        const img = document.createElement("img")
        img.src = src;
        item.appendChild(img)
        item.appendChild(document.createTextNode(name))
        item.onclick = (ev) => {
            if (this.selectedMesh) {
                this.selectedMesh.renderOutline = false;
            }
            if (item.classList.contains("selected")) {
                item.classList.remove("selected")
                this.selectedMat = null;
            }
            else {
                for (let i = 0; i < itemList.children.length; i++) {
                    itemList.children[i].classList.remove("selected");
                    item.classList.add("selected");
                    this.selectedMat = mat;
                }
            }
        }
        itemList.appendChild(item);
    }

    private async _initControllers(): Promise<void> {

        console.log("START - _initControllers - START");


        this._firstPersonController = new Controller(ControllersEnum.firstPerson, this._scene);
        this._topDownController = new Controller(ControllersEnum.topDown, this._scene);
        this._twoDController = new Controller(ControllersEnum.twoD, this._scene);

        if (this._allowDebugMode) {
            this._debugController = new Controller(ControllersEnum.debug, this._scene);
        }

        console.log("END - _initControllers - END");
    }

    private _updateOrthoAspectRatio(): void {

        let twoDControllerCamera = this._twoDController.camera;
        let aspectRatio = this._engine.getAspectRatio(twoDControllerCamera);

        let orthoTop = <number> twoDControllerCamera.orthoTop;
        twoDControllerCamera.orthoLeft = -orthoTop * aspectRatio;
        twoDControllerCamera.orthoBottom = -orthoTop;
        twoDControllerCamera.orthoRight = orthoTop * aspectRatio;
    }

    private async _changeController(controller:ControllersEnum, buttonPressed?:HTMLDivElement): Promise<void> {
        
        // Remove active class from all HTML buttons
        this._twoDCameraButton.classList.remove("active");
        this._threeDCameraButton.classList.remove("active");
        this._subjectiveCameraButton.classList.remove("active");

        // Deactivate currently active Controller
        this._activeController?.deactivateController();
        
        // Find and activate new controller and assign it as activeCamera 
        let newController = eval("this._" + controller);
        this._scene.activeCamera = newController.camera;
        newController.activateController();
        
        // Add active class to clicked button
        buttonPressed?.classList.add("active")

        // Replace previous activeController by newController
        this._activeController = newController;
    }

    // Create a fullscreen UI for all GUI elements
    // private async _initGUI(): Promise<void> {
    //     const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    //     guiMenu.idealHeight = 720; //fit our fullscreen ui to this height
        
    //     //create a simple button
    //     const startBtn = Button.CreateSimpleButton("start", "PLAY");
    //     startBtn.width = 0.2;
    //     startBtn.height = "40px";
    //     startBtn.color = "white";
    //     startBtn.top = "-14px";
    //     startBtn.thickness = 0;
    //     startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    //     guiMenu.addControl(startBtn);
        
    //     //this handles interactions with the start button attached to the scene
    //     startBtn.onPointerDownObservable.add(() => {
    //         this._initScene();
    //         this._scene.detachControl(); //observables disabled
    //     });
    // }
    
    // Initialize Environment
    

    private async _initEnvironment(): Promise<void> {
        console.log("START - _initEnvironment - START")
        
        //--CREATE ENVIRONMENT--
        const environment = new Environment(this._scene);
        this._environment = environment;
        await this._environment.load();
        
        console.log("END - _initEnvironment - END")
        
        //...load assets
    }
    
    // Adds event to toggle inspector
    private async _initInspector(): Promise<void> {
        console.log("START - _initInspector - START")
        
        window.addEventListener("keydown", (ev) => {
            // Shift + I
            if (ev.shiftKey && ev.key.toLowerCase() == "i") {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });
        
        
        console.log("END - _initInspector - END")
    }

    // Adds event to toggle debug mode
    private async _initDebugMode(): Promise<void> {
        
        let twoDCameraButton = <HTMLDivElement> document.getElementById("two-d-camera-button");
        let threeDCameraButton = <HTMLDivElement> document.getElementById("three-d-camera-button");
        let subjectiveCameraButton = <HTMLDivElement> document.getElementById("subjective-camera-button");
        
        window.addEventListener("keydown", (ev) => {
            if (this._isKeyLoggerOn) {
                console.log(ev.key, ev.keyCode)
            }
            // Shift + D
            if (ev.shiftKey && ev.key.toLowerCase() == "d") {
                this._toggleDebugMode();
            }
            // Shift + C
            if (ev.shiftKey && ev.key.toLowerCase() == "c") {
                twoDCameraButton.classList.remove("active");
                threeDCameraButton.classList.remove("active");
                subjectiveCameraButton.classList.remove("active");
                this._changeController(ControllersEnum.debug);
            }
            // I
            if (ev.key.toLowerCase() == "i") {
                console.log(this._environment?.walls)
                console.log(this._scene.collisionsEnabled)
            }
        });
    }

    // Handles toggling on and off the display of debugging mode
    private async _toggleDebugMode(): Promise<void> {

        if (this._isDebugDisplayOn) {
            // Turn off debugger
            this._debugAssets?.dispose()
            
            this._isDebugDisplayOn = false;
        } else {
            // Turn on debugger
            this._debugAssets = new AxesViewer(this._scene, 2);
            
            this._isDebugDisplayOn = true;
        }
    }
}
new App();

//DvCoreEngine.Main.Instance.scene.debugLayer.show()