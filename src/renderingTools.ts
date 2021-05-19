import * as vscode from "vscode";
import {
    glo,
    IEditorInfo,
    TyInLineInDepthInQueueInfo,
    TyDepthDecInfo,
    notYetDisposedDecsObject,
} from "./extension";
import { IBlockRender } from "./utils";

export interface ISingleLineBox {
    editorInfo: IEditorInfo;
    depth: number; // 0 means entire file. 1 means first level block....
    inDepthBlockIndex: number;
    lineBlockType: "opening" | "middle" | "closing" | "onlyLine";
    isfirstFromTopToDown: boolean;
    isFirstFromBottomToUp: boolean;
    lineZero: number;
    boxHeight: number; // px

    boxLeftEdge: number; // px
    boxRightEdge: number; // px

    optimalLeftOfRangePx: number;
    optimalRightOfRangePx: number;

    legitFirstLineZero: number;
    legitLastLineZero: number;
    isFocusedBlock: boolean;

    firstLineHasVisibleChar: boolean;
    lastLineHasVisibleChar: boolean;
}

export const renderSingleLineBox = ({
    editorInfo,
    depth,
    inDepthBlockIndex,
    lineBlockType,
    isfirstFromTopToDown,
    isFirstFromBottomToUp,
    lineZero,
    boxHeight,

    boxLeftEdge,
    boxRightEdge,

    optimalLeftOfRangePx,
    optimalRightOfRangePx,

    legitFirstLineZero,
    legitLastLineZero,
    isFocusedBlock,

    firstLineHasVisibleChar,
    lastLineHasVisibleChar,
}: ISingleLineBox): void => {
    // console.log("lineZero:", lineZero);
    const upEdge = editorInfo.upToDateLines.upEdge;
    const lowEdge = editorInfo.upToDateLines.lowEdge;
    if (
        // !isFocusedBlock &&
        upEdge >= 0 &&
        lowEdge >= 1 &&
        upEdge <= lowEdge &&
        lineZero >= upEdge &&
        lineZero <= lowEdge
    ) {
        return;
    }

    // console.log("ai laiiiinnn:::", lineZero, upEdge, lowEdge);

    if (lineBlockType === "onlyLine" && !glo.renderInSingleLineAreas) {
        return;
    }

    // console.log(
    //     "Rendering:",
    //     "line:",
    //     lineZero + 1,
    //     "depthIndex",
    //     depth,
    //     "inDepthBlockIndex",
    //     inDepthBlockIndex,
    // );

    let borderSize = glo.borderSize;
    const borderRadius = glo.borderRadius;
    // let borderColor: string = `rgba(152, 108, 255, 1)`;
    // let borderColor: string = `rgba(255, 255, 255, 0.150)`;
    let borderColor: string = glo.coloring.border;
    let zIndex = -1000 + depth * 10;

    let borderCss: string;
    let borderRadiusCss: string;
    let top = 0;
    let specificHeight = boxHeight;

    let backgroundCSS: string = "red";

    switch (depth) {
        case 0:
            backgroundCSS = glo.coloring.onEachDepth[0];
            borderColor = glo.coloring.borderOfDepth0;
            // zIndex = -100 + 10;
            break;

        case 1:
            backgroundCSS = glo.coloring.onEachDepth[1];
            break;
        case 2:
            backgroundCSS = glo.coloring.onEachDepth[2];
            break;
        case 3:
            backgroundCSS = glo.coloring.onEachDepth[3];
            break;
        case 4:
            backgroundCSS = glo.coloring.onEachDepth[4];
            break;
        case 5:
            backgroundCSS = glo.coloring.onEachDepth[5];
            break;

        case 6:
            backgroundCSS = glo.coloring.onEachDepth[6];
            break;
        case 7:
            backgroundCSS = glo.coloring.onEachDepth[7];
            break;
        case 8:
            backgroundCSS = glo.coloring.onEachDepth[8];
            break;
        case 9:
            backgroundCSS = glo.coloring.onEachDepth[9];
            break;
        case 10:
            backgroundCSS = glo.coloring.onEachDepth[10];
            break;

        default:
            backgroundCSS = "rgba(150, 150, 150, 0)";
    }

    if (glo.enableFocus && isFocusedBlock) {
        // backgroundCSS = "rgb(21, 5, 64)";
        // backgroundCSS = "rgb(13, 2, 41)";
        // backgroundCSS = "rgb(27, 12, 48)";

        if (glo.coloring.focusedBlock !== "same") {
            backgroundCSS = glo.coloring.focusedBlock;
            // backgroundCSS = "rgba(154, 10, 80, 0)";
        }

        if (glo.coloring.borderOfFocusedBlock !== "same") {
            borderColor = glo.coloring.borderOfFocusedBlock;
        }

        borderSize = 2;
        // zIndex = -3;
    }

    const boxLeftEdgeFixedShift = boxLeftEdge - borderSize;

    if (lineBlockType === "opening") {
        borderCss = `
            border-left: ${borderSize}px solid ${borderColor};
            border-top: ${borderSize}px solid ${borderColor};
            border-right: ${borderSize}px solid ${borderColor};

            
        `;
        borderRadiusCss = `${borderRadius}px ${borderRadius}px 0px 0px`;
        top += 2 - borderSize;
        specificHeight -= isFirstFromBottomToUp ? 2 : 0;

        if (isFirstFromBottomToUp) {
            if (firstLineHasVisibleChar) {
                // top += 2; // 0
                // specificHeight -= 2; // boxHeight
            } else {
                // top = 0 + 2; // 0
                specificHeight -= 2; // boxHeight
            }
        }

        // specificHeight = isFirstFromBottomToUp
        //     ? boxHeight - generalBorderSize / 2
        //     : undefined;
    } else if (lineBlockType === "middle") {
        borderCss = `
            border-left: ${borderSize}px solid ${borderColor};
            border-right: ${borderSize}px solid ${borderColor};


           
        `;
        // top -= isfirstFromTopToDown ? generalBorderSize : 0;
        borderRadiusCss = `0px`;

        // zIndex -= 1;
        if (isfirstFromTopToDown) {
            // return;
            top += 2;
            specificHeight -= 2;
            // backgroundCSS = "red";
        }
        if (isFirstFromBottomToUp) {
            specificHeight -= 2;
        }
    } else if (lineBlockType === "closing") {
        // console.log("isfirstFromTopToDown:", isfirstFromTopToDown);
        borderCss = `
            border-left: ${borderSize}px solid ${borderColor};
            border-right: ${borderSize}px solid ${borderColor};
            border-bottom: ${borderSize}px solid ${borderColor};

            
        `;
        // top += isfirstFromTopToDown ? generalBorderSize : 0;
        // top += 8;
        borderRadiusCss = `0px 0px ${borderRadius}px ${borderRadius}px;`;

        // specificHeight = isfirstFromTopToDown
        //     ? boxHeight - generalBorderSize / 2
        //     : undefined;
        // top -= 1;
        top -= 2;
        // specificHeight -= 2;
        if (isfirstFromTopToDown) {
            if (lastLineHasVisibleChar) {
                top += 2; // 0
                specificHeight -= 2; // boxHeight
            } else {
                top = 0 + 2; // 0
                specificHeight -= 4; // boxHeight
            }
        }
    } else {
        // lineBlockType === "onlyLine"
        borderCss = `
            border-left: ${borderSize}px solid ${borderColor};
            border-right: ${borderSize}px solid ${borderColor};
            border-bottom: ${borderSize}px solid ${borderColor};
            border-top: ${borderSize}px solid ${borderColor};
        `;
        borderRadiusCss = `${borderRadius}px ${borderRadius}px ${borderRadius}px ${borderRadius}px;`;
        top -= borderSize - 2;
        specificHeight -= 4;
    }

    const currVsRange = new vscode.Range(lineZero, 0, lineZero, 0); // must be ZERO! IMPORTANT! otherwise may be dimmer when text is dimmer

    if (lineZero === 0) {
        top += 1;
    }

    // =======================
    const newQueueInfo: TyInLineInDepthInQueueInfo = {
        lineZero,
        depthIndex: depth,
        inDepthBlockIndex,
        decorsRefs: {
            mainBody: null, // temporal. It will not remain as null, it will be decor
            leftLineOfOpening: "f", // may remain as "f", may change
            rightLineOfClosing: "f", // may remain as "f", may change
        },
    };

    const thisLineObjectBefore = editorInfo.decors[lineZero];

    if (!thisLineObjectBefore) {
        editorInfo.decors[lineZero] = [];
    }
    const thisLineObjectAfter = editorInfo.decors[lineZero] as TyDepthDecInfo[];

    const thisLineDepthObjectBefore = thisLineObjectAfter[depth];
    if (!thisLineDepthObjectBefore) {
        thisLineObjectAfter[depth] = [newQueueInfo];
    } else {
        thisLineObjectAfter[depth]?.push(newQueueInfo);
    }

    const thisLineDepthObjectAfter = thisLineObjectAfter[
        depth
    ] as TyInLineInDepthInQueueInfo[];

    // thisLineDepthObjectAfter.depth = depth; // maybe no need
    // thisLineDepthObjectAfter.inDepthBlockIndex = inDepthBlockIndex; // maybe no need

    // console.log("editorInfo.decors:", editorInfo.decors);
    // ========================

    // const doc = editorInfo.editorRef.document;

    // const thisLineData = doc.lineAt(lineZero);

    // here the heavy heeeaaaavy job begins:
    // return;

    const isAtVeryLeft = boxLeftEdgeFixedShift < 2;
    const leftInc = isAtVeryLeft ? 2 : 0;
    const lineDecoration = vscode.window.createTextEditorDecorationType({
        before: {
            // rangeBehavior: 1,
            // contentText,

            contentText: ``,

            // margin: "500px",
            // border: '1px solid yellow',
            // backgroundColor: backgroundCSS, // -------------
            // width: "0px",
            // height: "0px",
            textDecoration: `;box-sizing: content-box !important;
                              ${borderCss}
                              
                              border-radius: ${borderRadiusCss};

                              width: ${boxRightEdge - boxLeftEdge - leftInc}px;
                              height: ${specificHeight}px;
                              position: absolute;
                              z-index: ${zIndex};
                              top: ${top}px;
                              left: ${boxLeftEdgeFixedShift + leftInc}px;
                              background: ${backgroundCSS};
                              `,
            // padding: 100px;
        },

        // rangeBehavior: vscode.DecorationRangeBehavior.OpenOpen,
        // border: "1px solid blue",

        // backgroundColor: `rgba(24, 230, 168, 0)`,
        // textDecoration: `;border-radius: 10px;
        // 				  width: 500px;
        // 				  z-index: -500;
        // 				  `,

        // border: "5px solid black",
        // borderRadius: "5px",
        // isWholeLine : wholeLine
        // rangeBehavior: 1,
    } as vscode.DecorationRenderOptions);

    if (lineBlockType === "opening") {
        // isFirstFromBottomToUp
        let b = -2;

        if (isFirstFromBottomToUp) {
            b += 2;
        }

        const isAtVeryLeft = optimalLeftOfRangePx - borderSize < 2;
        const leftInc = isAtVeryLeft ? 2 : 0;
        const width = boxLeftEdge - optimalLeftOfRangePx + 0;

        if (width >= 3) {
            const leftLineOfOpening = vscode.window.createTextEditorDecorationType(
                {
                    before: {
                        // rangeBehavior: 1,
                        // contentText,

                        contentText: ``,

                        // margin: "500px",
                        // border: '1px solid yellow',
                        backgroundColor: "rgba(0, 0, 0, 0)", // transparent
                        // width: "0px",
                        // height: "0px",
                        textDecoration: `;box-sizing: content-box !important;
                                      border-bottom: ${borderSize}px solid ${borderColor};
     
                                      width: ${
                                          width > 3 ? width - leftInc + 1 : 0
                                      }px;
                                      bottom: ${b}px;
                                      height: ${5}px;
                                      position: absolute;
                                      z-index: ${zIndex + 300};
                                      
                                      left: ${
                                          optimalLeftOfRangePx -
                                          borderSize +
                                          leftInc
                                      }px;
                                      `,
                        // padding: 100px;
                    },
                } as vscode.DecorationRenderOptions,
            );

            // thisLineDepthObjectAfter.decorsRefs.leftLineOfOpening = leftLineOfOpening;

            thisLineDepthObjectAfter[
                thisLineDepthObjectAfter.length - 1
            ]!.decorsRefs.leftLineOfOpening = leftLineOfOpening;

            // if (lineZero === 103) {
            notYetDisposedDecsObject.decs.push({
                dRef: leftLineOfOpening,
                lineZero,
            });
            editorInfo.editorRef.setDecorations(leftLineOfOpening, [
                currVsRange,
            ]);
            // console.log("openingiiiisss - leftLineOfOpening");
            // }
        }
    }

    if (lineBlockType === "closing") {
        let t = -2;
        if (isfirstFromTopToDown) {
            t += 2;
        }

        const isAtVeryLeft = boxRightEdge < 2;
        const leftInc = isAtVeryLeft ? 2 : 0;
        const width = optimalRightOfRangePx - boxRightEdge + borderSize;

        if (width >= 3) {
            const rightLineOfClosing = vscode.window.createTextEditorDecorationType(
                {
                    before: {
                        // rangeBehavior: 1,
                        // contentText,

                        contentText: ``,

                        // margin: "500px",
                        // border: '1px solid yellow',
                        backgroundColor: "rgba(0, 0, 0, 0)", // transparent
                        // width: "0px",
                        // height: "0px",
                        textDecoration: `;box-sizing: content-box !important;
                                      border-top: ${borderSize}px solid ${borderColor};
     
                                      width: ${
                                          width > 3 ? width - leftInc : 0
                                      }px;
                                      top: ${t}px;
                                      height: ${5}px;
                                      position: absolute;
                                      z-index: ${zIndex + 300};
                                      
                                      left: ${boxRightEdge + leftInc}px;
                                      `,
                        // padding: 100px;
                    },
                } as vscode.DecorationRenderOptions,
            );

            thisLineDepthObjectAfter[
                thisLineDepthObjectAfter.length - 1
            ]!.decorsRefs.rightLineOfClosing = rightLineOfClosing;

            // if (lineZero === 103) {
            notYetDisposedDecsObject.decs.push({
                dRef: rightLineOfClosing,
                lineZero,
            });
            editorInfo.editorRef.setDecorations(rightLineOfClosing, [
                currVsRange,
            ]);
            // console.log("openingiiiisss - rightLineOfClosing");
            // }
        }
    }

    thisLineDepthObjectAfter[
        thisLineDepthObjectAfter.length - 1
    ]!.decorsRefs.mainBody = lineDecoration;

    // if (lineZero === 103) {
    notYetDisposedDecsObject.decs.push({
        dRef: lineDecoration,
        lineZero,
    });
    editorInfo.editorRef.setDecorations(lineDecoration, [currVsRange]);
    // }
};

export const renderSingleBlock = ({
    firstLineHasVisibleChar,
    lastLineHasVisibleChar,
    firstVisibleChar,
    lastVisibleChar,
    optimalLeftOfRange,
    optimalRightOfRange,
    depth,
    inDepthBlockIndex,
    firstLineZeroOfRender,
    lastLineZeroOfRender,
    editorInfo,
    lang,
    isFocusedBlock,
    absRangeEndPos,
}: IBlockRender) => {
    if (!firstVisibleChar || firstVisibleChar.lineZero < 0) {
        return;
    }

    for (
        let currLineZero = firstVisibleChar.lineZero;
        currLineZero <= lastVisibleChar.lineZero;
        currLineZero += 1
    ) {
        if (currLineZero < firstLineZeroOfRender) {
            continue;
        }
        if (currLineZero > lastLineZeroOfRender) {
            break;
        }

        let lChar = optimalLeftOfRange;
        let rChar = optimalRightOfRange;
        let currType: "opening" | "middle" | "closing" | "onlyLine";

        let isfirstFromTopToDown = false;
        let isFirstFromBottomToUp = false;

        // console.log("firstLineHasVisibleChar:", firstLineHasVisibleChar);
        // console.log("currLineZero:", currLineZero);
        // console.log(
        //     "firstVisibleChar.lineZero + 1:",
        //     firstVisibleChar.lineZero + 1,
        // );

        if (
            firstLineHasVisibleChar &&
            currLineZero === firstVisibleChar.lineZero + 1
        ) {
            isfirstFromTopToDown = true;
        }

        if (
            lastLineHasVisibleChar &&
            currLineZero === lastVisibleChar.lineZero - 1
        ) {
            isFirstFromBottomToUp = true;
        }

        if (firstVisibleChar.lineZero === lastVisibleChar.lineZero) {
            currType = "onlyLine";
        } else if (currLineZero === firstVisibleChar.lineZero) {
            currType = "opening";
            if (firstLineHasVisibleChar) {
                // if (!["python"].includes(lang)) {
                // for language which is not based on indentation
                lChar = firstVisibleChar.inLineIndexZero;
                // }
            }
        } else if (currLineZero === lastVisibleChar.lineZero) {
            currType = "closing";
            if (lastLineHasVisibleChar) {
                // if (!["python"].includes(lang)) {
                // for language which is not based on indentation

                // }

                if (
                    !(
                        absRangeEndPos &&
                        editorInfo.monoText[absRangeEndPos.globalIndexZero] ===
                            "\n"
                    )
                ) {
                    rChar = lastVisibleChar.inLineIndexZero;
                }
            }
        } else {
            currType = "middle";
        }

        // if (depth === 2) {
        // console.log("rendering depth");

        const singleRangeRendArg = {
            editorInfo,
            depth,
            inDepthBlockIndex,
            lineBlockType: currType,
            isfirstFromTopToDown,
            isFirstFromBottomToUp,
            lineZero: currLineZero,
            boxHeight: glo.eachCharFrameHeight, // px

            boxLeftEdge: glo.eachCharFrameWidth * lChar, // px
            boxRightEdge: glo.eachCharFrameWidth * (rChar + 1), // px

            optimalLeftOfRangePx: optimalLeftOfRange * glo.eachCharFrameWidth,
            optimalRightOfRangePx:
                (optimalRightOfRange + 1) * glo.eachCharFrameWidth,

            legitFirstLineZero: firstLineZeroOfRender,
            legitLastLineZero: lastLineZeroOfRender,
            isFocusedBlock,

            firstLineHasVisibleChar,
            lastLineHasVisibleChar,
        };

        renderSingleLineBox(singleRangeRendArg);

        // }
    }
};