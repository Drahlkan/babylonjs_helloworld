import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, Vector3, Mesh, Color3, Color4, ShadowGenerator, GlowLayer, PointLight, FreeCamera, CubeTexture, Sound, PostProcess, Effect, SceneLoader, Matrix, MeshBuilder, Quaternion, AssetsManager, ArcRotateCamera, HemisphericLight } from "@babylonjs/core";
import {AdvancedDynamicTexture, Button, Control, } from "@babylonjs/gui"

import { Environment } from "./environment";

class App {
    // General Entire Application
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _scene: Scene;
    private _environment?: Environment | null;
    
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

        // Initialize inspector
        this._initInspector();

        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

    }

    // Initialize HTML UI functionalities
    private async _initUI(): Promise<void> {
        console.log("START - _initUI - START")

        this._initFullscreenToggle()
        this._initSidePanelToggle()
        this._initResetButton()

        console.log("END - _initUI - END")
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

    // Initialize main Scene
    private async _initScene(): Promise<void> {
        console.log("START - _initScene - START")

        this._engine.displayLoadingUI(); //make sure to wait for start to load

        this._scene.detachControl();

        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 0, 0, 1);

        
        let camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
        camera.attachControl(this._canvas, true);
        
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
        
        // let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        // camera.setTarget(Vector3.Zero());
        
        //TODO
        //create a fullscreen ui for all of our GUI elements
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720; //fit our fullscreen ui to this height
        
        //create a simple button
        const startBtn = Button.CreateSimpleButton("start", "PLAY");
        startBtn.width = 0.2;
        startBtn.height = "40px";
        startBtn.color = "white";
        startBtn.top = "-14px";
        startBtn.thickness = 0;
        startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        guiMenu.addControl(startBtn);
        
        //this handles interactions with the start button attached to the scene
        startBtn.onPointerDownObservable.add(() => {
            this._initScene();
            scene.detachControl(); //observables disabled
        });
        //END TODO
        
        //--SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        
        // Dispose of previous scene and assign new one.
        this._scene.dispose();
        scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098);
        this._scene = scene;
        await this._initEnvironment();

        this._engine.hideLoadingUI();
        console.log("END - _initScene - END")
        
    }
    
    private async _initEnvironment(): Promise<void> {
        console.log("START - _initEnvironment - START")

        //--CREATE ENVIRONMENT--
        const environment = new Environment(this._scene);
        this._environment = environment;
        await this._environment.load();

        console.log("END - _initEnvironment - END")
    
        //...load assets
    }

    // Initialize Inspector toggle functionality
    private async _initInspector(): Promise<void> {
        console.log("START - _initInspector - START")

        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey) {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });

        console.log("END - _initInspector - END")
    }
}
new App();