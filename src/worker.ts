const ctx: Worker = self as any;
import MoveLyric from './moveLyric'

let offscreenCanvas: OffscreenCanvas|null = null;
const collors = ["rgb(187,225,14)", "rgb(237,139,190)"];

ctx.addEventListener('message', event => {

    if (!offscreenCanvas) {
        if (event.data.action !== 'init') {
            console.log('You need to call init first');
        }
        offscreenCanvas = event.data.canvas;
    }

    if (!offscreenCanvas === null) {
        console.log("couldn't get the offscreenCanvas");
        return;
    }

    let context: OffscreenCanvasRenderingContext2D | null = offscreenCanvas!.getContext("2d");

    if (context === null) {
        console.log("couldn't get the OffscreenCanvasRenderingContext2D");
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
                let myReq = requestAnimationFrame(fadeIn);
                if (1 <= time) {
                    cancelAnimationFrame(myReq);
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

            context.font = "20px 'ＭＳ ゴシック'";
            context.fillStyle = 'rgba(237,139,190, 100)';
            context.fillText(charText, x, y);
            break;
        case 'fallLyric':
            if (moveLyricInstance === null) {
                console.log("'fallLyric' requires a moveLyricInstance");
                return;
            }
            let fall = () => {
                if (context === null) {
                    return;
                }
                y += height / 300;

                context.fillStyle = 'rgb(246, 221, 191)';
                context.fillRect(0, 0, width, height);

                context.font = "20px 'ＭＳ ゴシック'";
                context.fillStyle = 'rgba(237,139,190, 100)';
                context.fillText(charText, x, y);
                let myReq = requestAnimationFrame(fall);
                if (y <= height) {
                    cancelAnimationFrame(myReq);
                }
            }
            fall();
            break;
        default:
            console.log('undefind action');
    }
});

export default ctx
