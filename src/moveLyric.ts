
class MoveLyric {
    public canvas: OffscreenCanvas;
    public x: number;
    public y: number;
    public charText: string;

    constructor(data: any) {
        this.canvas = data.canvas;
        this.x = data.x;
        this.y = data.y;
        this.charText = data.char;
    }
}
export default MoveLyric