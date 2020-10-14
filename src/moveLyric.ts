
class MoveLyric {
    public canvas: HTMLCanvasElement;
    public x: number;
    public y: number;
    public height: number;
    public charText: string;

    constructor(data: any) {
        this.canvas = data.canvas;
        this.x = data.x;
        this.y = data.y;
        this.height = data.height;
        this.charText = data.char;
    }
}
export default MoveLyric