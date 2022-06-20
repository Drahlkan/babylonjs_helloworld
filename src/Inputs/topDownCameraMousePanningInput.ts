import { ArcRotateCamera, BaseCameraPointersInput, IPointerEvent, PointerTouch, Nullable, ICameraInput, Tools, PointerEventTypes, PointerInfo, EventState, Observer } from "@babylonjs/core";


export class TopDownCameraMousePanningInput implements ICameraInput<ArcRotateCamera> {

    public camera!: ArcRotateCamera;

    protected _buttonsPressed!: number;

    private _currentActiveButton: number = -1;
    private _contextMenuBind!: EventListener;

    public buttons = [0, 1, 2];

    public panningSensibility: number = 1000.0;

    private _isPanClick: boolean = false;

    private _pointerInput!: (p: PointerInfo, s: EventState) => void;
    private _observer!: Nullable<Observer<PointerInfo>>;
    private _onLostFocus!: Nullable<(e: FocusEvent) => any>;
    private _pointA!: Nullable<PointerTouch>;
    private _pointB!: Nullable<PointerTouch>;
    
    
    /**
     * Gets the class name of the current input.
     * @returns the class name
     */
    public getClassName(): string {
        return "TopDownCameraMousePanningInput";
    }

    /**
     * Get the friendly name associated with the input class.
     * @returns the input friendly name
     */
    public getSimpleName(): string {
        return "pointers";
    }

    /**
     * Attach the input controls to a specific dom element to get the input from.
     * @param noPreventDefault Defines whether event caught by the controls should call preventdefault() (https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
     */
     public attachControl(noPreventDefault?: boolean): void {
        noPreventDefault = Tools.BackCompatCameraNoPreventDefault(arguments);

        const engine = this.camera.getEngine();
        const element = engine.getInputElement();

        this._pointA = null;
        this._pointB = null;

        this._buttonsPressed = 0;    
        
        this._pointerInput = (p) => {

            const evt = <IPointerEvent>p.event;

            if (p.type !== PointerEventTypes.POINTERMOVE && this.buttons.indexOf(evt.button) === -1) {
                return;
            }

            const srcElement = <HTMLElement>(evt.srcElement || evt.target);

            this._buttonsPressed = evt.buttons;

            if (engine.isPointerLock) {
                const offsetX = evt.movementX || evt.mozMovementX || evt.webkitMovementX || evt.msMovementX || 0;
                const offsetY = evt.movementY || evt.mozMovementY || evt.webkitMovementY || evt.msMovementY || 0;

                this.onTouch(offsetX, offsetY);
                this._pointA = null;
                this._pointB = null;
            } else if (p.type === PointerEventTypes.POINTERDOWN && this._currentActiveButton === -1 ) {
                try {
                    srcElement?.setPointerCapture(evt.pointerId);
                } catch (e) {
                    //Nothing to do with the error. Execution will continue.
                }

                if (this._pointA === null) {
                    this._pointA = {
                        x: evt.clientX,
                        y: evt.clientY,
                        pointerId: evt.pointerId,
                        type: evt.pointerType,
                    };
                } else if (this._pointB === null) {
                    this._pointB = {
                        x: evt.clientX,
                        y: evt.clientY,
                        pointerId: evt.pointerId,
                        type: evt.pointerType,
                    };
                }

                if (this._currentActiveButton === -1) {
                    this._currentActiveButton = evt.button;
                }
                this.onButtonDown(evt);

                if (!noPreventDefault) {
                    evt.preventDefault();
                    element && element.focus();
                }
            } 
            else if (p.type === PointerEventTypes.POINTERUP && (this._currentActiveButton === evt.button)) {
                try {
                    srcElement?.releasePointerCapture(evt.pointerId);
                } catch (e) {
                    //Nothing to do with the error.
                }

                //would be better to use pointers.remove(evt.pointerId) for multitouch gestures,
                //but emptying completely pointers collection is required to fix a bug on iPhone :
                //when changing orientation while pinching camera,
                //one pointer stay pressed forever if we don't release all pointers
                //will be ok to put back pointers.remove(evt.pointerId); when iPhone bug corrected
                if (engine._badOS) {
                    this._pointA = this._pointB = null;
                } 
                else {
                    //only remove the impacted pointer in case of multitouch allowing on most
                    //platforms switching from rotate to zoom and pan seamlessly.
                    if (this._pointB && this._pointA && this._pointA.pointerId == evt.pointerId) {
                        this._pointA = this._pointB;
                        this._pointB = null;
                    } 
                    else if (this._pointA && this._pointB && this._pointB.pointerId == evt.pointerId) {
                        this._pointB = null;
                    } 
                    else {
                        this._pointA = this._pointB = null;
                    }
                }

                this._currentActiveButton = -1;

                if (!noPreventDefault) {
                    evt.preventDefault();
                }
            }
            else if (p.type === PointerEventTypes.POINTERMOVE) {
                if (!noPreventDefault) {
                    evt.preventDefault();
                }

                // One button down
                if (this._pointA && this._pointB === null) {
                    const offsetX = evt.clientX - this._pointA.x;
                    const offsetY = evt.clientY - this._pointA.y;
                    this.onTouch(offsetX, offsetY);

                    this._pointA.x = evt.clientX;
                    this._pointA.y = evt.clientY;
                }
            }
        };

        this._observer = this.camera
            .getScene()
            .onPointerObservable
            .add(
                this._pointerInput,
                PointerEventTypes.POINTERDOWN | 
                PointerEventTypes.POINTERUP | 
                PointerEventTypes.POINTERMOVE
            );

        this._onLostFocus = () => {
            this._pointA = this._pointB = null;
            this.onLostFocus();
        };

        this._contextMenuBind = <EventListener> this.onContextMenu.bind(this);

        element && element.addEventListener("contextmenu", this._contextMenuBind, false);

        const hostWindow = this.camera.getScene().getEngine().getHostWindow();

        if (hostWindow) {
            Tools.RegisterTopRootEvents(hostWindow, [{ name: "blur", handler: this._onLostFocus }]);
        }
    }

    /**
     * Detach the current controls from the specified dom element.
     */
    public detachControl(): void {
        if (this._onLostFocus) {
            const hostWindow = this.camera.getScene().getEngine().getHostWindow();
            if (hostWindow) {
                Tools.UnregisterTopRootEvents(hostWindow, [{ name: "blur", handler: this._onLostFocus }]);
            }
        }

        if (this._observer) {
            this.camera.getScene().onPointerObservable.remove(this._observer);
            this._observer = null;

            if (this._contextMenuBind) {
                const inputElement = this.camera.getScene().getEngine().getInputElement();
                inputElement && inputElement.removeEventListener("contextmenu", this._contextMenuBind);
            }

            this._onLostFocus = null;
        }

        this._buttonsPressed = 0;
        this._currentActiveButton = -1;
    }

    /**
     * Called on pointer POINTERMOVE event if only a single touch is active.
     * @param offsetX
     * @param offsetY
     */
     public onTouch(offsetX: number, offsetY: number): void {
        if (this.panningSensibility !== 0 && this._isPanClick) {
            this.camera.inertialPanningX += -offsetX / this.panningSensibility;
            this.camera.inertialPanningY += offsetY / this.panningSensibility;
        }
    }

    /**
     * Called on JS contextmenu event.
     * Override this method to provide functionality.
     * @param evt
     */
     public onContextMenu(evt: PointerEvent): void {
        evt.preventDefault();
    }

    /**
     * Called each time a new POINTERDOWN event occurs. Ie, for each button
     * press.
     * @param evt
     */
    public onButtonDown(evt: IPointerEvent): void {
        this._isPanClick = evt.button === this.camera._panningMouseButton;
    }

    /**
     * Called when window becomes inactive.
     */
    public onLostFocus(): void {
        this._isPanClick = false;
    }
}