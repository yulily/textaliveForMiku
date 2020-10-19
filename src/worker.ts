const ctx: Worker = self as any;
import MoveLyric from './moveLyric'

let offscreenCanvas: OffscreenCanvas|null = null;
let context: OffscreenCanvasRenderingContext2D | null = null;

const fontSize = 25;
const collors = ["rgb(187,225,14)", "rgb(237,139,190)"];

ctx.addEventListener('message', event => {

    if (!offscreenCanvas) {
        if (event.data.action !== 'init') {
            console.log('You need to call init first');
        }
        offscreenCanvas = event.data.canvas;
        context = offscreenCanvas!.getContext("2d");
    }

    if (offscreenCanvas === null || context === null) {
        console.log("couldn't get the offscreenCanvas or couldn't get the OffscreenCanvasRenderingContext2D");
        return;
    }

    let width: number = event.data.size.width;
    let height: number = event.data.size.height;

    let moveLyricInstance: MoveLyric|null = null;
    let x: number = 0, y: number = 0, charText: string = '';
    if (event.data.moveLyricInstance) {
        moveLyricInstance = event.data.moveLyricInstance;
        if (moveLyricInstance === null) {
            console.log("moveLyricInstance is null");
            return;
        }
        x = moveLyricInstance.x;
        y = moveLyricInstance.y;
        charText = moveLyricInstance.charText;
    }

    switch (event.data.action) {
        case 'init':
            let time = 0;
            let fadeIn = () => {
                if (context === null) {
                    return;
                }
                context.fillStyle = 'rgba(246, 221, 191, ' + Math.min(time, 1) + ')';
                context.fillRect(0, 0, width, height);

                time += 0.1;
                let callbackId = requestAnimationFrame(fadeIn);
                if (1 <= time) {
                    cancelAnimationFrame(callbackId);
                }
            }
            fadeIn();
            break;
        case 'setChar':
            if (moveLyricInstance === null) {
                console.log("'setChar' requires a moveLyricInstance");
                return;
            }
            context.fillStyle = 'rgb(246, 221, 191)';
            context.fillRect(0, 0, width, height);

            context.font = fontSize + "px 'Hannari,sans-serif'";
            context.fillStyle = 'rgb(237,139,190)';
            context.fillText(charText, x, y);
            break;
        case 'fallLyric':
            if (moveLyricInstance === null) {
                console.log("'fallLyric' requires a moveLyricInstance");
                return;
            }            
            fall(charText, x, y, height);
            break;
        default:
            console.log('undefind action');
    }
});

let fall = (charText: string, x: number, y: number, height: number) => {
    loop();

    y = Math.floor(y);
    function loop(){
        if (context !== null) {
            let callbackId = requestAnimationFrame(loop);

            let diffY = Math.floor(height / 40) * easeInOutSine(y / height);

            context.fillStyle = 'rgb(246, 221, 191)';
            context.fillRect(x, y - diffY - fontSize, fontSize, fontSize);
            
            context.font = fontSize + "px 'Hannari,sans-serif'";
            context.fillStyle = 'rgba(237,139,190, 100)';
            context.fillText(charText, x, y);

            y += diffY;
            if (height < y) {
                context.fillStyle = 'rgb(246, 221, 191)';
                context.fillRect(x, y - diffY - fontSize, fontSize, fontSize);
                cancelAnimationFrame(callbackId);
            }
        }
    }
}

function easeInOutSine(x: number): number {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}
export default ctx
