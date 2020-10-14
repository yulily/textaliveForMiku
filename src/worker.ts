const ctx: Worker = self as any;
import MoveLyric from './moveLyric'


console.log("workerjs");

ctx.addEventListener('message', event => {
    console.log(event);
    let param: MoveLyric = event.data.moveLyric;

    let offscreenCanvas = param.canvas;
    let x: number = param.x;
    let y: number = param.y;
    let height: number = param.height;
    let charText: string = param.charText;

    let context: CanvasRenderingContext2D | null = offscreenCanvas.getContext("2d");

    let fall = (timestamp: DOMHighResTimeStamp) => {
        if (context === null) {
            return;
        }
        y += height / 300;
        //drawCanvas!.background('#F6DDBF');
        console.log(charText);
        context.fillText(charText, x, y);
        let myReq = window.requestAnimationFrame(fall);
        if (y <= height) {
            cancelAnimationFrame(myReq);
        }
    }

    window.requestAnimationFrame(fall);
});

export default ctx
