let { expose } = require("threads/worker")

expose({
    async replace(data) {
        let {processId, guestUser, doc, stringMap, imageMap, imageFiles} =data;
        // let res = "results/" + uuid() + ".png";

        let arg1 = JSON.stringify({
            body: {
                template: doc.slug + ".docx",
                stringMap,
                imageMap,
                files: imageFiles,
            },
        });

        doc = JSON.parse(fs.readFileSync(join(__dirname, 'docs/', doc.slug + '.json')));
        let imageData = await replaceImg(doc, stringMap);

        let fname = uuid() + '.png';
        fs.writeFileSync(join(__dirname, 'results/', fname), await ImageDataToBlob(imageData));
        console.log('run complete', join(__dirname, 'results/', fname), await ImageDataToBlob(imageData));

        let res = { fileName: fname, error: null };
        // await new Promise((r) => setTimeout(() => r(), 1000));
        return res;
    }
})