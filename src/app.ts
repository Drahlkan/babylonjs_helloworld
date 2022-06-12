import { Environment } from "./environment";
import { BabylonCanvas } from "./babylonCanvas"

class App {

    // General Entire Application
    public babylonCanvas: BabylonCanvas;
    public resetButton: HTMLAnchorElement;
    public hello: String;
    
    constructor() {
        
        this.babylonCanvas = new BabylonCanvas()

        
        this.resetButton = <HTMLAnchorElement> document.getElementById("reset-button");
        this.hello = "HI"

        this._initResetButton()
    }

    // Initialize reset button functionality
    public async _initResetButton() {
        console.log("START - _initResetButton - START")
        console.log(this.babylonCanvas._engine)
        this.resetButton.onclick = this._resetScene
        console.log("END - _initResetButton - END")
    }

    private _resetScene = () => {
        this.babylonCanvas._initScene()
    }
}
new App();