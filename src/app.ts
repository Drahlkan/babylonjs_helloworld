import { Environment } from "./environment";
import { BabylonCanvas } from "./babylonCanvas"

class App {

    // General Entire Application
    private _babylonCanvas: BabylonCanvas;
    private _resetButton: HTMLAnchorElement;
    public hello: String;
    
    constructor() {
        
        this._babylonCanvas = new BabylonCanvas()

        this._resetButton = <HTMLAnchorElement> document.getElementById("reset-button");
        this.hello = "HI"

        this._initResetButton()
    }

    // Initialize reset button functionality
    private async _initResetButton(): Promise<void> {
        console.log("START - _initResetButton - START")
        
        this._resetButton.onclick = this._babylonCanvas._initScene

        console.log("END - _initResetButton - END")
    }

    public test():void {
        console.log("TESTESTESTEST")
        console.log(this._resetButton)
        console.log(this.hello)
    }
}
new App();