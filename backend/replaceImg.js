let { fabric } = require('fabric');
let { registerFont, Image, createCanvas } = require('canvas');
let fs = require('fs')


const writeFile = (path, data, opts = 'utf8') =>
    new Promise((resolve, reject) => {
        fs.writeFile(path, data, opts, (err) => {
            if (err) reject(err)
            else resolve()
        })
    })


function offsetBy(rect, x, y) {
    return [
        [rect[0][0] + x, rect[0][1] + y],
        [rect[1][0] + x, rect[1][1] + y],
        [rect[2][0] + x, rect[2][1] + y],
        [rect[3][0] + x, rect[3][1] + y],
    ]
}
function getResizedRect(rect, width, height) {
    let boundingRect = boundingRectForQuadrilateral(rect);
    let xScale = width / (boundingRect[2][0] - boundingRect[0][0]);
    let yScale = height / (boundingRect[2][1] - boundingRect[0][1]);
    return [
        [rect[0][0] * xScale, rect[0][1] * yScale],
        [rect[1][0] * xScale, rect[1][1] * yScale],
        [rect[2][0] * xScale, rect[2][1] * yScale],
        [rect[3][0] * xScale, rect[3][1] * yScale],
    ];
}
function cropToSize(imageData, width, height) {
    []
    return new Promise(async (resolve) => {
        const image = new Image();
        image.onload = () => {
            let canvas = createCanvas(width, height);
            // canvas.width = width;
            // canvas.height = height;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, width, height, 0, 0, width, height);
            let resizedImageData = ctx.getImageData(0, 0, width, height);
            resolve(resizedImageData);
        }
        image.src = await ImageDataToBlob(imageData);
    });
}
function getResizedImageData(imageData, width, height) {
    return new Promise(async (resolve) => {
        const image = new Image();
        image.onload = () => {
            let canvas = createCanvas(width, height);
            // canvas.width = width;
            // canvas.height = height;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, width, height);
            let resizedImageData = ctx.getImageData(0, 0, width, height);
            resolve(resizedImageData);
        };
        image.src = await ImageDataToBlob(imageData);
    });
}

function boundingRectForQuadrilateral(points) {
    let topLeftX = Math.min(points[0][0], points[3][0]);
    let topLeftY = Math.min(points[0][1], points[1][1],);
    let bottomRightX = Math.max(points[1][0], points[2][0]);
    let bottomRightY = Math.max(points[3][1],);
    return [
        [topLeftX, topLeftY],
        [bottomRightX, topLeftY],
        [bottomRightX, bottomRightY],
        [topLeftX, bottomRightY],
    ]
}

function trueBoundingRectForQuadrilateral(points) {
    let topLeftX = Math.min(points[0][0], points[1][0], points[2][0], points[3][0]);
    let topLeftY = Math.min(points[0][1], points[1][1], points[2][1], points[3][1],);
    let bottomRightX = Math.max(points[0][0], points[1][0], points[2][0], points[3][0]);
    let bottomRightY = Math.max(points[0][1], points[1][1], points[2][1], points[3][1]);
    return [
        [topLeftX, topLeftY],
        [bottomRightX, topLeftY],
        [bottomRightX, bottomRightY],
        [topLeftX, bottomRightY],
    ]
}
function drawPerspective(imageData, transf) {
    return new Promise(async (resolve, reject) => {

        var image = new Image();
        image.onload = function () {
            // var perspectiveCanvas = document.getElementById("canvas2");

            let persp = [
                [0, 0],
                [imageData.width, 0],
                [imageData.width, imageData.height],
                [0, imageData.height]
            ]


            persp = persp.map((p, i) => {
                return p.map((v, j) => {
                    return v + transf[i][j];
                })
            });

            persp = transf;
            var perspectiveCanvas = createCanvas(imageData.width, Math.max(persp[2][1], persp[3][1]));
            // perspectiveCanvas.height = imageData.height;// Math.max(persp[2][1], persp[3][1]);
            perspectiveCanvas.height = Math.max(persp[2][1], persp[3][1]);
            perspectiveCanvas.width = imageData.width;
            var ctx = perspectiveCanvas.getContext("2d");
            var p = new Perspective(perspectiveCanvas.getContext("2d"), image);
            p.draw(persp);

            resolve(ctx.getImageData(0, 0, perspectiveCanvas.width, perspectiveCanvas.height));
        }

        image.src = await ImageDataToBlob(imageData);
    });

};

async function ImageDataToUrl(imageData) {
    return URL.createObjectURL(await ImageDataToBlob(imageData));
}

function ImageDataToBlob(imageData) {
    let w = imageData.width;
    let h = imageData.height;
    let canvas = createCanvas(w, h);
    // canvas.width = w;
    // canvas.height = h;
    let ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve) => {
        resolve(canvas.toBuffer());
    });
}

async function drawText(text, options) {
    var text_size = 150;
    let { maxWidth, font } = options || {};
    let { name: fontName, color } = font || {};
    if (fontName)
        registerFont(join(__dirname, 'fonts', fontName + '.ttf'), { family: fontName });

    let textCanvas = createCanvas();
    //   textCanvas.style.border = "1px solid blue ";
    textCanvas.width = maxWidth || 20000;
    textCanvas.height = text_size;
    let textCtx = textCanvas.getContext("2d");
    // textCanvas.height = 100;
    textCtx.lineWidth = 4;

    var rectHeight = text_size;
    var rectWidth = 530;

    var rectX = text_size / 10;
    var rectY = text_size / 10;

    let rect = [rectX, rectY, rectWidth, rectHeight];

    var text_font = fontName || "ocrb10";
    var the_text = text || '-- no text --';
    textCtx.font = text_size + "px " + text_font;
    var textMetrics = textCtx.measureText(the_text);
    var actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    var actualWidth = textMetrics.actualBoundingBoxLeft + textMetrics.actualBoundingBoxRight;
    var text_ratio = 1.1;
    // while (actualWidth * text_ratio > rectWidth || actualHeight * text_ratio > rectHeight) {
    //     if (actualWidth * text_ratio > rectWidth) {
    //         rectWidth++;
    //     }


    //     text_size = text_size - 1;
    //     textCtx.font = text_size + "px " + text_font;
    //     textMetrics = textCtx.measureText(the_text);
    //     actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    //     actualWidth = textMetrics.actualBoundingBoxLeft + textMetrics.actualBoundingBoxRight;
    // }


    // roundRect(textCtx, rectX, rectY, actualWidth, actualHeight, 0,);

    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";
    textCtx.strokeStyle = color || "#000000";
    textCtx.fillStyle = color || "#000000";

    // document.body.appendChild(textCanvas);
    // textCanvas.width = actualWidth ;
    textCtx.fillText(the_text, rectX + (actualWidth / 2), rectY + (actualHeight / 2));



    return textCtx.getImageData(0, 0, rectX + (actualWidth), text_size);
}

function getInfiniteGrid(renderCanvas) {

    const GRID_COLOR = "#000000";
    const GRID_OPACITY = 0.3;
    const CELL_SIZE = 20;

    const MAX_SCALE = 20;
    const MIN_SCALE = 0.2;

    // window.onresize = function () {
    //     renderCanvas.setWidth(1000);
    //     renderCanvas.setHeight(1001);
    // };

    renderCanvas.on("mouse:wheel", function (opt) {
        let zoom = renderCanvas.getZoom();
        zoom *= 0.999 ** opt.e.deltaY;
        if (zoom > MAX_SCALE) zoom = MAX_SCALE;
        if (zoom < MIN_SCALE) zoom = MIN_SCALE;

        renderCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
    });

    renderCanvas.on("mouse:up", function (opt) {
        this.setViewportTransform(this.viewportTransform);
        this.isDragging = false;
        this.selection = true;
    });

    renderCanvas.on("mouse:down", function (opt) {
        if (opt.e.button === 1) {
            this.isDragging = true;
            this.selection = false;
            this.lastPosX = opt.e.clientX;
            this.lastPosY = opt.e.clientY;
            opt.e.preventDefault();
        }
    });

    renderCanvas.on("mouse:move", function (opt) {
        if (this.isDragging) {
            this.viewportTransform[4] += opt.e.clientX - this.lastPosX;
            this.viewportTransform[5] += opt.e.clientY - this.lastPosY;

            this.lastPosX = opt.e.clientX;
            this.lastPosY = opt.e.clientY;
            this.requestRenderAll();
        }
    });

    var infBGrid = fabric.util.createClass(fabric.Object, {
        type: "infBGrid",

        initialize: function () { },

        render: function (ctx) {
            let zoom = renderCanvas.getZoom();
            let offX = renderCanvas.viewportTransform[4];
            let offY = renderCanvas.viewportTransform[5];

            ctx.save();
            ctx.strokeStyle = "#cecece";
            ctx.lineWidth = 1;

            let gridSize = CELL_SIZE * zoom;

            const numCellsX = Math.ceil(renderCanvas.width / gridSize);
            const numCellsY = Math.ceil(renderCanvas.height / gridSize);

            let gridOffsetX = offX % gridSize;
            let gridOffsetY = offY % gridSize;

            let originVertical = [];
            let originHorizontal = [];
            ctx.beginPath();
            // draw vectical lines
            for (let i = 0; i <= numCellsX; i++) {
                let x = gridOffsetX + i * gridSize;
                if ((x - offX) / zoom === 0) {
                    originVertical = [[(x - offX) / zoom, (0 - offY) / zoom], [(x - offX) / zoom, (renderCanvas.height - offY) / zoom]];
                };
                ctx.moveTo((x - offX) / zoom, (0 - offY) / zoom);
                ctx.lineTo((x - offX) / zoom, (renderCanvas.height - offY) / zoom);
            }

            // draw horizontal lines
            for (let i = 0; i <= numCellsY; i++) {
                let y = gridOffsetY + i * gridSize;
                if ((y - offY) / zoom === 0) {
                    originHorizontal = [[(0 - offX) / zoom, (y - offY) / zoom], [(renderCanvas.width - offX) / zoom, (y - offY) / zoom]];
                }
                ctx.moveTo((0 - offX) / zoom, (y - offY) / zoom);
                ctx.lineTo((renderCanvas.width - offX) / zoom, (y - offY) / zoom);
            }

            ctx.stroke();
            ctx.closePath();



            // ctx.beginPath();
            // ctx.strokeStyle = "#000000";
            // ctx.lineWidth = 1;
            // ctx.moveTo(originVertical[0][0], originVertical[0][1]);
            // ctx.lineTo(originVertical[1][0], originVertical[1][1]);
            // ctx.moveTo(originHorizontal[0][0], originHorizontal[0][1]);
            // ctx.lineTo(originHorizontal[1][0], originHorizontal[1][1]);
            // ctx.stroke();
            // ctx.closePath();


            ctx.restore();




        },
    });

    var bg = new infBGrid();
    return bg;
}

function addImageAsync(imageUrl, options) {
    return new Promise((resolve, reject) => {
        fabric.Image.fromURL('file://' + imageUrl, (image) => {
            resolve(image);
        });
    });
}
function getPolyVertices(polygon) {
    // const points = poly.points,
    //   vertices = [];

    // console.log(canvas.current.getZoom())
    // points.forEach((point) => {

    //   let [panX, panY] = [canvas.current.viewportTransform[4], canvas.current.viewportTransform[5]];
    //   const x = point.x - poly.pathOffset.x,
    //     y = point.y - poly.pathOffset.y;
    //   vertices.push(
    //     fabric.util.transformPoint(
    //       { x: x, y: y },
    //       fabric.util.multiplyTransformMatrices(
    //         poly.canvas.viewportTransform,
    //         poly.calcTransformMatrix()
    //       )
    //     )
    //   );
    // });

    // return vertices;

    var matrix = polygon.calcTransformMatrix();
    var transformedPoints = polygon.get("points")
        .map(function (p) {
            return new fabric.Point(
                p.x - polygon.pathOffset.x,
                p.y - polygon.pathOffset.y
            );
        })
        .map(function (p) {
            return fabric.util.transformPoint(p, matrix);
        });
    return (transformedPoints);
}


async function getPerpectiveImgObj(imd, startCoord, reshape = false) {

    let boundingRect = boundingRectForQuadrilateral(startCoord);
    let trueBoundingRect = trueBoundingRectForQuadrilateral(startCoord);

    // console.log('boundingRect', boundingRect);
    // let scaledCoords = 
    let transform = offsetBy(startCoord, -boundingRect[0][0], -boundingRect[0][1])
    // transform = getResizedRect(transform, (boundingRect[1][0] - boundingRect[0][0]) * 10, (boundingRect[3][1] - boundingRect[0][1]) * 10);
    let scale = (boundingRect[3][1] - boundingRect[0][1]) / imd.height;
    imd = await getResizedImageData(imd, scale * imd.width, scale * imd.height);

    if (!reshape)
        imd = await cropToSize(imd, (boundingRect[1][0] - boundingRect[0][0]), (boundingRect[3][1] - boundingRect[0][1]))
    else
        imd = await getResizedImageData(imd, (transform[1][0] - transform[0][0]), (transform[3][1] - transform[0][1]))


    let persData = await drawPerspective(imd, transform);

    function getDat(imageData) {
        return new Promise(async (resolve) => {
            const image = new Image();
            image.onload = () => {
                let canvas = createCanvas(imageData.width, imageData.height);
                // canvas.width = width;
                // canvas.height = height;
                let ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0, imageData.width, imageData.height);
                let resizedImageData = ctx.getImageData(0, 0, imageData.width, imageData.height);
                resolve(image);
            };
            image.src = await ImageDataToBlob(imageData);
        });
    }

    var img = new Image();
    img.src = (persData);
    let filename = join(__dirname, 'tmp-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + '.jpg');
    await writeFile(filename, await ImageDataToBlob(persData));
    let oImg = await addImageAsync(filename);
    // console.log(filename )
    fs.unlinkSync(filename);


    // let oImg = await addImageAsync(await ImageDataToUrl(persData));
    oImg.set({
        left: boundingRect[0][0], top: boundingRect[0][1],
        scaleX: (trueBoundingRect[1][0] - trueBoundingRect[0][0]) / persData.width,
        scaleY: (trueBoundingRect[3][1] - trueBoundingRect[0][1]) / persData.height
    });
    // oImg.set({ left: startCoord[0][0], top: startCoord[0][1], scaleX: (startCoord[1][0] - startCoord[0][0]) / persData.width, scaleY: (startCoord[3][1] - startCoord[0][1]) / persData.height });
    return (oImg);
}
function getImageDataFromUrl(url) {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
            const canvas = createCanvas(image.width, image.height);
            // canvas.width = image.width;
            // canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            resolve(imageData);
        };
        image.src = url;
    });
}
// returns ImageData
async function replaceImg(doc, placeValueMap, extras) {

    if (extras?.font) {
        const myFont = new FontFace(extras.font.name, extras.font.src);
        await myFont.load();
        document.fonts.add(myFont);
    }
    console.log('started');

    var renderCanvas = new fabric.StaticCanvas(null, { width: 200, height: 200 })



    // renderCanvas.add(getInfiniteGrid(renderCanvas));


    let oImg = await addImageAsync(join(__dirname, 'docs', doc.data.template.bg));

    oImg.selectable = false;
    oImg.hoverCursor = 'default';
    oImg.lockMovementX = true;
    oImg.lockMovementY = true;
    renderCanvas.add(oImg);


    let boundary = new fabric.Rect({
        fill: "#00000000",
        stroke: "#00000055",
        top: 0,
        left: 0,
        width: (oImg.getScaledWidth()),
        height: (oImg.getScaledHeight()),
        selectable: false,
        hoverCursor: 'default',
    })
    renderCanvas.setDimensions({ width: oImg.getScaledWidth(), height: oImg.getScaledHeight() });
    // renderCanvas.add(boundary);



    placeValueMap = Object.fromEntries(Object.entries(placeValueMap).map(([key, value]) => {
        return [key.toLowerCase(), value];
    }))
    for (let field of doc.data.fields) {
        // renderCanvas.add(new fabric.Polygon(field.points.map((p) => ({ x: p[0], y: p[1] })), {
        //     fill: 'red',
        //     stroke: 'red',
        //     strokeWidth: '4',
        //     selectable: false,
        // }));

        let imd = null;
        let mappedVal = placeValueMap[field.name.toLowerCase()];
        if (!mappedVal) continue;
        let { type, value } = mappedVal;
        if (typeof mappedVal == 'string') {
            value = mappedVal;
            type = 'text';
        }
        console.log(field.name, value);
        if (!type || type == 'text')
            imd = await drawText(value, {
                font: {
                    name: field.font || doc.data.font?.name || 'ocr10',
                    color: field.color || doc.data.font?.color || '#000000',
                }
            });
        else if (type == 'image')
            imd = await modOpacity(await getImageDataFromUrl(value), field.opacity || 1);

        let modImd = await getPerpectiveImgObj(imd, field.points, type == 'image');
        renderCanvas.insertAt(modImd, field.hasOwnProperty('zIndex') ? field.zIndex : renderCanvas.getObjects().length);

    }

    let coverImg = await addImageAsync(join(__dirname, 'docs', doc.data.template.cover));
    coverImg.selectable = false;
    coverImg.hoverCursor = 'default';
    coverImg.lockMovementX = true;
    coverImg.lockMovementY = true;
    renderCanvas.add(coverImg);



    renderCanvas.renderAll();
    let resImd = await getImageDataFromUrl(renderCanvas.toDataURL({
        left: boundary.left,
        top: boundary.top,
        width: boundary.width,
        height: boundary.height
    }));


    resImd = await trimImage(resImd);
    // resImd = await expandUniform(resImd, resImd.width + 200, resImd.height + 200);

    return resImd;
    return renderCanvas;

}

function expandUniform(imagedata, finalWidth, finalHeight) {
    return new Promise(async (resolve) => {
        let img = new Image();
        img.onload = () => {

            var canvas = createCanvas(finalHeight, finalHeight);
            canvas.width = finalHeight;
            canvas.height = finalHeight;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, (finalWidth / 2) - (imagedata.width / 2), (finalHeight / 2) - (imagedata.height / 2));
            resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));

        }

        img.src = await ImageDataToBlob(imagedata);
    });
}
function modOpacity(imagedata, opacity = 1) {
    return new Promise(async (resolve) => {
        let img = new Image();
        img.onload = () => {

            var canvas = createCanvas(imagedata.width, imagedata.height);
            canvas.width = imagedata.width;
            canvas.height = imagedata.height;
            var ctx = canvas.getContext('2d');
            ctx.globalAlpha = opacity;
            ctx.drawImage(img, 0, 0);
            resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
        }

        img.src = await ImageDataToBlob(imagedata);
    })
}
async function trimImage(imageData) {
    // Create a new Image object
    return new Promise(async (resolve) => {
        var img = new Image();

        // Set the source of the image

        // When the image is loaded
        img.onload = function () {

            // Create a canvas element
            var canvas = createCanvas(imageData.width, imageData.height);
            var ctx = canvas.getContext('2d');

            // Set the canvas dimensions to match the image
            canvas.width = imageData.width;
            canvas.height = imageData.height;


            var data = imageData.data;

            // Variables to store the boundaries
            var minX = canvas.width;
            var minY = canvas.height;
            var maxX = 0;
            var maxY = 0;

            // Scan the pixels to find the boundaries of opaque pixels
            for (var y = 0; y < canvas.height; y++) {
                for (var x = 0; x < canvas.width; x++) {
                    var index = (y * canvas.width + x) * 4; // Get the index of the current pixel

                    // Check if the pixel is opaque (not transparent)
                    if (data[index + 3] > 0) {
                        // if (x < minX)
                        //     console.log('new min', x, y)
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
            }

            // Calculate the trimmed width and height
            var trimmedWidth = maxX - minX + 1;
            var trimmedHeight = maxY - minY + 1;

            // Create a new canvas with the trimmed dimensions
            var trimmedCanvas = createCanvas(trimmedWidth, trimmedHeight);
            var trimmedCtx = trimmedCanvas.getContext('2d');
            trimmedCanvas.width = trimmedWidth;
            trimmedCanvas.height = trimmedHeight;

            // Draw the trimmed image onto the new canvas
            trimmedCtx.drawImage(img, minX, minY, trimmedWidth, trimmedHeight, 0, 0, trimmedWidth, trimmedHeight);

            // Get the trimmed image data
            var trimmedImageData = trimmedCtx.getImageData(0, 0, trimmedWidth, trimmedHeight);

            // Use the trimmed image data as needed (e.g., display or save the trimmed image)
            // console.log(trimmedImageData);

            resolve(trimmedImageData);
        }
        img.src = await ImageDataToBlob(imageData);
    });

}



let Perspective = require('./perspective.js');
const { join } = require('path');

(async () => {

    let doc = JSON.parse(fs.readFileSync(join(__dirname, 'docs/uk_passport.json')));
    var res = await replaceImg(doc, { SURNAME: { type: 'text', value: 'TAYLOR' }, photo: { type: 'image', value: join(__dirname, 'no-image.png') } });
    console.log(res)
    await writeFile('test.jpg', await ImageDataToBlob(res));

    // // console.log(res);
    // return
    // var rect = new fabric.Rect({
    //     left: 100,
    //     top: 100,
    //     width: 100,
    //     height: 50,
    //     fill: "red"
    // })
    // canvas.add(rect);
    // canvas.renderAll();
    // canvas.createPNGStream().pipe(fs.createWriteStream("./output.png"))
})

module.exports = { replaceImg, ImageDataToBlob }