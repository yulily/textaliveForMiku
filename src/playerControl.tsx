import React, { useEffect, useState, useMemo } from "react";
import { CSSTransition } from 'react-transition-group';
import { Player, Ease } from "textalive-app-api"
import MoveLyric from './moveLyric'
import lyricWorker from "worker-loader!./worker";

const worker = new lyricWorker();

export const PlayerControl = () => {
    const [, setPlayer] = useState<Player | null>(null);
    const [, setApp] = useState(null);

    const [song, setSong] = useState<string>('');
    const [artist, setArtist] = useState<string>('');

    const [openCurtain, setOpenCurtain] = useState<boolean>(false);
    const [hideSongUI, setHideSongUI] = useState<boolean>(false);

    const [mediaElement, setMediaElement] = useState<HTMLDivElement | null>(null);
    const [mediaDisplay, setMediaDisplay] = useState<boolean>(false);
    const mediaDiv = useMemo(() => <div className={`media movie`} ref={setMediaElement} />, []);

    const [bottom, setBottom] = useState<string>('0');
    const maxBottom: number = 2;

    let offscreenCanvas: OffscreenCanvas | null = null;
    let playing: boolean = false;

    const width: number = window.innerWidth, height: number = window.innerHeight;
    const textAreaPadding: number = (width / 5) / 2;
    const textAreaWitdh: number = (width - textAreaPadding * 2);
    let lastChar: string = '', lastStartTime: number = 0, lastEndTime: number = 0;
    let isChorus: boolean = false;

    const [showEndCard, setEndCard] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window === "undefined" || !mediaElement) {
            return;
        }

        // TextAlive Player を作る
        const textPlayer = new Player({
            app: {
                appAuthor: "Jun Kato",
                appName: "Basic example",
                parameters: [],
            },
            mediaElement
        });

        const playerListener = {
            // TextAlive App が初期化されたときに呼ばれる
            onAppReady: (app: any) => {
                // ブレス・ユア・ブレス / 和田たけあき feat. 初音ミク
                // - 初音ミク「マジカルミライ 2019」テーマソング
                // - 楽曲: http://www.youtube.com/watch?v=a-Nf3QUFkOU
                // - 歌詞: https://piapro.jp/t/Ytwu
                textPlayer.createFromSongUrl("http://www.youtube.com/watch?v=a-Nf3QUFkOU", {
                    video: {
                        // 音楽地図訂正履歴: https://songle.jp/songs/1688650/history
                        beatId: 3818481,
                        chordId: 1546157,
                        repetitiveSegmentId: 1942135,
                        // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/www.youtube.com%2Fwatch%3Fv=a-Nf3QUFkOU
                        lyricId: 50146,
                        lyricDiffId: 3143
                    }
                });
                setApp(app);
            },
            // 音源の再生準備が完了した時に呼ばれる
            onTimerReady: (timer: any) => {
                // 動画配置
                setMediaDisplay(true);
                // canvas 設置
                let canvasElement = document.getElementById('canvasElement') as HTMLCanvasElement;
                offscreenCanvas = canvasElement.transferControlToOffscreen();
                worker.postMessage({ action: "init", size: { width: width, height: height }, canvas: offscreenCanvas }, [offscreenCanvas]);
            },
            // 動画オブジェクトの準備が整ったとき（楽曲に関する情報を読み込み終わったとき）に呼ばれる
            onVideoReady: () => {
                // カーテンオープン
                setOpenCurtain(true);
                // 楽曲情報を表示
                setSong(textPlayer.data.song.name);
                setArtist(textPlayer.data.song.artist.name);
            },
            // 動画の再生位置が変更されたときに呼ばれる
            onTimeUpdate: (positionTime: number) => {
                // プレイヤーが準備できていなかったら何もしない
                if (offscreenCanvas === null || !playing || !textPlayer || !textPlayer.video) {
                    return;
                }

                const beat = textPlayer.findBeat(positionTime);
                if (beat) {
                    let bottomRate: number = Ease.circIn(beat.progress(positionTime));
                    setBottom((maxBottom * bottomRate) -2 + '%');
                }

                // 100ms 前の発声文字を取得
                let char = textPlayer.video.findChar(positionTime -100);
                if (char === null) {
                    return;
                }

                let index = textPlayer.video.findIndex(char);

                let startTime = char.startTime;
                let endTime = char.endTime;

                let chorus = textPlayer.findChorus(positionTime);
                if (chorus) {
                    isChorus = -1 < chorus.progress(positionTime) ? true : false;
                } else {
                    isChorus = false;
                }

                // 開始 発声分の 100ms 追加
                if (startTime < positionTime + 100) {
                    const beat = textPlayer.findBeat(positionTime);
                    let progress = 0;
                    if (beat) {
                        progress = beat.progress(positionTime);
                    }

                    let x = 50 * (index % Math.floor(textAreaWitdh / 50)) + textAreaPadding;
                    let parabolaX = (x <= width / 2) ? width / 2 - x : x - width / 2; 
                    let y = (height/3.4) -(1 / (width * 1.3) * (parabolaX * parabolaX));

                    const moveLyricInstance = new MoveLyric({
                        canvas: null,
                        x: x,
                        y: y,
                        height: height,
                        char: char.text,
                        partOfSpeech: char.parent.pos,
                        isChorus: isChorus
                    });

                    if (positionTime < startTime) {
                        // 開始
                        worker.postMessage({ action: "setChar", size: { width: width, height: height }, moveLyricInstance: moveLyricInstance });
                    } else if (endTime < positionTime) {
                        // 終了
                        if (lastChar === char.text && lastStartTime === startTime && lastEndTime === endTime) {
                            return;
                        }
                        lastChar = char.text;
                        lastStartTime = startTime;
                        lastEndTime = endTime;
                        worker.postMessage({ action: "fallLyric", size: { width: width, height: height }, moveLyricInstance: moveLyricInstance });
                    } else {
                        // 発声 
                        worker.postMessage({ action: "setChar", size: { width: width, height: height }, moveLyricInstance: moveLyricInstance });
                    }
                }
            },
            // 動画の再生位置が変更されたときに呼ばれる（あまりに頻繁な発火を防ぐため一定間隔に間引かれる）
            onThrottledTimeUpdate: (positionTime: number) => {},
            // TextAlive アプリのパラメタが更新されたときに呼ばれる
            onAppParameterUpdate: (name: any, value: any) => {},
            // 再生が始まったら
            onPlay: () => {
                playing = true;
                // 司会者退場
                setHideSongUI(true);
            },
            // 再生が一時停止したら
            onPause: () => {
                playing = false;
            },
            // 再生が停止したら
            onStop: () => {
                playing = false;
                // カーテンクローズ
                setOpenCurtain(false);
                setEndCard(true);
            }
        }
        // TextAlive Player のイベントリスナを登録する
        textPlayer.addListener(playerListener);
        setPlayer(textPlayer);

    }, [mediaElement]);

    return (
        <>
            <div className={`curtain curtainLeft ${openCurtain ? 'open' : 'close'}`}></div>
            <div className={`songInfo ${hideSongUI ? 'hide' : ''}`}>
                <dl>
                    <dt>artist</dt>
                    <dd>{artist}</dd>
                    <dt>song</dt>
                    <dd>{song}</dd>
                </dl>
                <div className="emcee"><img src='./emcee.png' /></div>
            </div>
            <div className={`mediaWrap ${mediaDisplay ? 'mediaFade' : ''}`}>
                <p className={`click ${hideSongUI ? 'hide' : ''}`}>Click here ↓</p>
                {mediaDiv}
            </div>
            <div className="seats" style={{ bottom: bottom }}><img src='./seats.png' /></div>
            <div className="gradient"></div>
            <canvas id="canvasElement" width={window.innerWidth} height={window.innerHeight} className="canvasElement" ref={React.createRef()} />
            <div className={`curtain curtainRight ${openCurtain ? 'open' : 'close'}`}></div>
            <CSSTransition
                in={showEndCard}
                timeout={1000}
                classNames="fade"
                unmountOnExit
            >
                {status => {
                    return (
                        <div className="endCard"></div>
                    )
                }}
            </CSSTransition>
        </>
    
    );

}


