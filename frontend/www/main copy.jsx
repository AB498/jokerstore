let GeneratorItem = ({ data }) => {
  return (
    <div
      class={
        (ids_implemented.includes(data.slug) ? "" : "opacity-50") +
        " my-1 p-2 border rounded hover:bg-gray-200 full flex gap-2 px-2 items-center" +
        (open.current ? " bg-yellow-500" : "") +
        (state.current.currentId == data.id ? " bg-yellow-500" : "")
      }
      onClick={() => {
        state.current.currentId = data.id;
        // navigate(`/generator/${data.slug}`);
      }}
    >
      <div className="w-8 h-8">
        <img src={"images/" + data.icon.slice(data.icon.lastIndexOf("/") + 1)} alt="" className="w-full h-full rounded " />
      </div>
      <div className="text-lg">
        {data.id} {data.name}
      </div>
    </div>
  );
};

let Disabled = ({ children, condition }) => {
  let ref = useRef();
  useEffect(() => {
    if (!ref.current) return;
    if (condition) {
      ref.current.style.pointerEvents = "none";
      ref.current.style.opacity = "0.5";
    } else {
      ref.current.style.pointerEvents = "auto";
      ref.current.style.opacity = "1";
    }
  });
  return condition ? <children.type {...children.props} ref={ref}></children.type> : children;
};
let GeneratorPage = () => {
  let generationProgress = reactive({ progress: 0, status: "unstarted" });

  useEffect(() => {}, []);

  let selected = reactive(null);

  async function generateAndShow() {
    generationProgress.current = { progress: 0, status: "running" };
    try {
      let uploaderEl = document.getElementById("uploader");
      let formData = new FormData();

      let stringMap = { SURNAME: "John Doe", DOB: "01/01/1970" };
      let errors = false;

      let uploaderEls = [];
      function pushAtIndex(arr, index, value) {
        if (index >= arr.length) {
          arr.length = index + 1;
        }
        arr[index] = value;
      }

      doc.fields.forEach((item) => {
        let inputEl = document.querySelector(".form-input." + item.input_name);
        if (!inputEl.value) {
          inputEl.parentElement.querySelector(".error").classList.remove("hidden");
          inputEl.parentElement.querySelector(".error").innerHTML = "Please fill this field";
          errors = true;
        } else inputEl.parentElement.querySelector(".error").classList.add("hidden");

        if (item.type == "text") stringMap[item.input_name] = inputEl.value || item.input_placeholder;
      });

      let imgMap = {};
      for (let i = 0; i < doc.images.length; i++) {
        let img = doc.images[i];
        imgMap[i] = img.target_index;
        formData.append("file", document.querySelector(".form-input." + img.input_name).files[0]);
      }
      // pushAtIndex(uploaderEls, document.querySelector(".form-input.photo").files[0]);
      // pushAtIndex(uploaderEls, doc.images.find((item) => item.input_name == "signature").target_index, document.querySelector(".form-input.signature").files[0]);

      // uploaderEls.forEach((item) => {
      // });

      if (errors) {
        generationProgress.current = { progress: 0, status: "unstarted" };
        alertify.error("Please fill all required fields");
        return;
      }

      formData.append("bodyString", JSON.stringify({ template: `${doc.slug}.docx`, stringMap, imageMap: imgMap }));

      console.log("formData", stringMap, imgMap, uploaderEls);

      let res = await await fetch("api/special/generateid", {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("Content-Type");
      function ImageDataToBlob(imageData) {
        let w = imageData.width;
        let h = imageData.height;
        let canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        let ctx = canvas.getContext("2d");
        ctx.putImageData(imageData, 0, 0);

        return new Promise((resolve) => {
          canvas.toBlob(resolve);
        });
      }

      function getImageDataFromUrl(url) {
        return new Promise((resolve) => {
          const image = new Image();
          image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            resolve(imageData);
          };
          image.src = url;
        });
      }

      function getImageFromBlob(imageBlob) {
        return new Promise((resolve) => {
          const image = new Image();
          image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            resolve(imageData);
          };
          image.src = URL.createObjectURL(imageBlob);
        });
      }

      function getResizedImageData(imageData, width, height) {
        return new Promise(async (resolve) => {
          const image = new Image();
          image.onload = () => {
            let canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, width, height);
            let resizedImageData = ctx.getImageData(0, 0, width, height);
            resolve(resizedImageData);
          };
          image.src = URL.createObjectURL(new Blob([await ImageDataToBlob(imageData)], { type: "image/png" }));
        });
      }
      function drawOnContext(ctx, imageData, opacity = 1) {
        return new Promise(async (resolve) => {
          let image = new Image();
          image.onload = () => {
            ctx.globalAlpha = opacity;

            ctx.drawImage(image, ctx.canvas.width / 2 - imageData.width / 2, ctx.canvas.height / 2 - imageData.height / 2, imageData.width, imageData.height);
            ctx.globalAlpha = 1;
            resolve();
          };
          image.src = URL.createObjectURL(new Blob([await ImageDataToBlob(imageData)], { type: "image/png" }));
        });
      }
      function drawText(text) {
        var text_size = 50;

        let textCanvas = document.createElement("canvas");
        textCanvas.style.border = "1px solid blue ";
        textCanvas.width = 700;
        textCanvas.height = text_size;
        let textCtx = textCanvas.getContext("2d");
        // textCanvas.height = 100;
        textCtx.lineWidth = 4;
        textCtx.strokeStyle = "#000000";
        textCtx.fillStyle = "#abc";

        var rectHeight = text_size;
        var rectWidth = 530;

        var rectX = 0;
        var rectY = 0;

        let rect = [rectX, rectY, rectWidth, rectHeight];

        var text_font = "Arial";
        var the_text = text || "Some text";
        textCtx.font = text_size + "px " + text_font;
        var textMetrics = textCtx.measureText(the_text);
        var actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
        var actualWidth = textMetrics.actualBoundingBoxLeft + textMetrics.actualBoundingBoxRight;
        var text_ratio = 1.1;
        while (actualWidth * text_ratio > rectWidth || actualHeight * text_ratio > rectHeight) {
          if (actualWidth * text_ratio > rectWidth) {
            rectWidth++;
          }

          text_size = text_size - 1;
          textCtx.font = text_size + "px " + text_font;
          textMetrics = textCtx.measureText(the_text);
          actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
          actualWidth = textMetrics.actualBoundingBoxLeft + textMetrics.actualBoundingBoxRight;
        }

        // roundRect(textCtx, rectX, rectY, actualWidth, actualHeight, 0,);

        textCtx.textAlign = "center";
        textCtx.textBaseline = "middle";
        textCtx.fillStyle = "#000000";

        // document.body.appendChild(textCanvas);
        // textCanvas.width = actualWidth ;
        textCtx.fillText(the_text, rectX + actualWidth / 2, rectY + actualHeight / 2 + 10);

        return textCtx.getImageData(0, 0, actualWidth, actualHeight + 10);
      }

      async function overlayImage(imageData, overlayImageData) {
        const canvas = document.createElement("canvas");
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext("2d");
        await drawOnContext(ctx, imageData);
        await drawOnContext(ctx, await getResizedImageData(overlayImageData, canvas.width / 2, canvas.height / 2), 0.3);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
      }

      if (contentType && contentType.includes("image/")) {
        const imageBlob = await res.blob();
        let imageData = await getImageFromBlob(imageBlob);
        let protectedImgData = await overlayImage(imageData, await drawText("PREVIEW"));
        window.res = res;
        console.log("got results", res, res.headers.get("X-ID-String"));
        state.current.resultUrl = URL.createObjectURL(await ImageDataToBlob(protectedImgData));
        generationProgress.current = { progress: 100, status: "completed" };
      } else {
        const responseText = await res.text();
        res = safeParse(responseText) || res;
        console.log(res);
        alertify.error("Error: " + res.error);
        generationProgress.current = { progress: 100, status: "failed" };
      }
    } catch (error) {
      generationProgress.current = { progress: 100, status: "failed" };
    }
  }

  let docs = [
    {
      slug: "uk_passport",
      name: "UK Passport",
      // icon: "images/ukdl.png",
      fields: [
        {
          id: 206,
          input_label: "Surname",
          input_placeholder: "DOE",
          input_name: "SURNAME",
          type: "text",
          value: null,
          required: true,
          regular_expression: "[a-zA-Z][a-zA-Z ]+[a-zA-Z]|[a-zA-Z]|[a-zA-Z]{2}",
        },
        {
          id: 207,
          input_label: "Given names",
          input_placeholder: "JOHN",
          input_name: "GIVENNAME",
          type: "text",
          value: null,
          required: true,
          regular_expression: "[a-zA-Z][a-zA-Z ]+[a-zA-Z]|[a-zA-Z]|[a-zA-Z]{2}",
        },
        {
          id: 208,
          input_label: "Document Number (9 digits)",
          input_placeholder: "123456789",
          input_name: "PASSPORTNO",
          type: "text",
          value: null,
          required: true,
          regular_expression: "[0-9]{9}$",
        },
        {
          id: 210,
          input_label: "Date of birth (DD.MM.YYYY)",
          input_placeholder: "02.05.1960",
          input_name: "DOB",
          type: "text",
          value: null,
          required: true,
          regular_expression:
            "(((0[1-9]|[12][0-9]|3[01])\\.((0[13578]|1[02]))|((0[1-9]|[12][0-9]|30)\\.(0[469]|11))|(0[1-9]|[1][0-9]|2[0-8])\\.(02))\\.([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3}))|(29\\.02\\.(([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00)))",
        },
        {
          id: 211,
          input_label: "Date of issue (DD.MM.YYYY)",
          input_placeholder: "05.05.2015",
          input_name: "DOI",
          type: "text",
          value: null,
          required: true,
          regular_expression:
            "(((0[1-9]|[12][0-9]|3[01])\\.((0[13578]|1[02]))|((0[1-9]|[12][0-9]|30)\\.(0[469]|11))|(0[1-9]|[1][0-9]|2[0-8])\\.(02))\\.([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3}))|(29\\.02\\.(([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00)))",
        },
        {
          id: 212,
          input_label: "Date of expiration (DD.MM.YYYY)",
          input_placeholder: "05.05.2025",
          input_name: "DOE",
          type: "text",
          value: null,
          required: true,
          regular_expression:
            "(((0[1-9]|[12][0-9]|3[01])\\.((0[13578]|1[02]))|((0[1-9]|[12][0-9]|30)\\.(0[469]|11))|(0[1-9]|[1][0-9]|2[0-8])\\.(02))\\.([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3}))|(29\\.02\\.(([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00)))",
        },
        {
          id: 209,
          input_label: "Sex (M or F)",
          input_placeholder: "M",
          input_name: "SEX",
          type: "text",
          value: null,
          required: true,
          regular_expression: "[MmFf]",
        },
        {
          id: 213,
          input_label: "Nationality (Code)",
          input_placeholder: "GBR",
          input_name: "NATIONALITY",
          type: "text",
          value: "GBR",
          required: true,
          regular_expression: null,
        },
        {
          id: 214,
          input_label: "Place of Birth",
          input_placeholder: "LONDON",
          input_name: "POB",
          type: "text",
          value: null,
          required: true,
          regular_expression: null,
        },
      ],
      images: [
        {
          input_name: "photo",
          type: "file",
          target_index: 1,
        },
        {
          input_name: "signature",
          type: "file",
          target_index: 0,
        },
        {
          input_name: "photo",
          type: "file",
          target_index: 2,
        },
      ],
    },
    {
      slug: "uk_dl",
      name: "UK Driving License",
      icon: "images/ukdl.png",
      fields: [
        {
          id: 189,
          input_label: "Surname",
          input_placeholder: "Jeremy",
          input_name: "SURNAME",
          type: "text",
          value: null,
          required: true,
          regular_expression: "[a-zA-Z][a-zA-Z ]+[a-zA-Z]|[a-zA-Z]|[a-zA-Z]{2}",
        },
        {
          id: 190,
          input_label: "First Name",
          input_placeholder: "Clarkson",
          input_name: "GIWENNAME",
          type: "text",
          value: null,
          required: true,
          regular_expression: "[a-zA-Z][a-zA-Z ]+[a-zA-Z]|[a-zA-Z]|[a-zA-Z]{2}",
        },
        {
          id: 191,
          input_label: "Sex (M or F)",
          input_placeholder: "M",
          input_name: "SEX",
          type: "text",
          value: null,
          required: true,
          regular_expression: "[MmFf]",
        },
        {
          id: 192,
          input_label: "doc Number (10 letters)",
          input_placeholder: "GB12345678",
          input_name: "NUMBER",
          type: "text",
          value: null,
          required: true,
          regular_expression: "[a-zA-Z]{2}[0-9]{8}",
        },
        {
          id: 193,
          input_label: "Date of birth (DD.MM.YYYY)",
          input_placeholder: "12.05.1960",
          input_name: "DOB",
          type: "text",
          value: null,
          required: true,
          regular_expression:
            "(((0[1-9]|[12][0-9]|3[01])\\.((0[13578]|1[02]))|((0[1-9]|[12][0-9]|30)\\.(0[469]|11))|(0[1-9]|[1][0-9]|2[0-8])\\.(02))\\.([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3}))|(29\\.02\\.(([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00)))",
        },
        {
          id: 194,
          input_label: "Date of issue (DD.MM.YYYY)",
          input_placeholder: "06.09.2015",
          input_name: "DOI",
          type: "text",
          value: null,
          required: true,
          regular_expression:
            "(((0[1-9]|[12][0-9]|3[01])\\.((0[13578]|1[02]))|((0[1-9]|[12][0-9]|30)\\.(0[469]|11))|(0[1-9]|[1][0-9]|2[0-8])\\.(02))\\.([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3}))|(29\\.02\\.(([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00)))",
        },
        {
          id: 195,
          input_label: "Date of expiration (DD.MM.YYYY)",
          input_placeholder: "05.09.2025",
          input_name: "DOE",
          type: "text",
          value: null,
          required: true,
          regular_expression:
            "(((0[1-9]|[12][0-9]|3[01])\\.((0[13578]|1[02]))|((0[1-9]|[12][0-9]|30)\\.(0[469]|11))|(0[1-9]|[1][0-9]|2[0-8])\\.(02))\\.([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3}))|(29\\.02\\.(([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00)))",
        },
        {
          id: 196,
          input_label: "Place of Birth",
          input_placeholder: "UNITED KINGDOM",
          input_name: "POB",
          type: "text",
          value: "UNITED KINGDOM",
          required: true,
          regular_expression: null,
        },
        {
          id: 197,
          input_label: "Authority",
          input_placeholder: "DVLA",
          input_name: "AUTHORITY",
          type: "text",
          value: "DVLA",
          required: true,
          regular_expression: null,
        },
        {
          id: 198,
          input_label: "Address (Line 1)",
          input_placeholder: "110 ORFORD ROAD, WALTHAMSTOW",
          input_name: "ADDRES",
          type: "text",
          value: null,
          required: true,
          regular_expression: null,
        },
        {
          id: 199,
          input_label: "Address (Line 2)",
          input_placeholder: "LONDON, BR3 0GT",
          input_name: "ADDRES2",
          type: "text",
          value: null,
          required: false,
          regular_expression: null,
        },
        {
          id: 1747,
          input_label: "MRZ Number -- You can leave it blank!",
          input_placeholder: "JEREM605120C99TY 94",
          input_name: "NUMBER2",
          type: "text",
          value: null,
          required: false,
          regular_expression: "[a-zA-Z0-9][a-zA-Z0-9 ]+[a-zA-Z0-9]|[a-zA-Z0-9]|[a-zA-Z0-9]{2}",
        },
      ],
      images: [
        {
          input_name: "photo",
          type: "file",
          target_index: 1,
        },
        {
          input_name: "signature",
          type: "file",
          target_index: 0,
        },
      ],
    },
  ];

  let doc = docs.find((doc) => doc.slug == state.current.currentDocSlug);
  let options = [
    {
      name: "Driver's License",
      country: "United Kingdom",
      slug: "uk_dl",
    },
    {
      name: "Passport",
      country: "United Kingdom",
      slug: "uk_passport",
    },
  ];

  function optionsForCountry(country) {
    let res = [];
    for (let option of options) {
      if (option.country === country) {
        res.push(option);
      }
    }
    return res;
  }
  let CustomRadio = ({ data }) => {
    let id = reactive("customRadio" + uuid());
    useEffect(() => {
      const containerEle = document.getElementById(id.current);
      const selectedEle = document.getElementById("selectedIndicator" + id.current);

      const handleSelectRadio = (e) => {
        // Query the parent `label` element
        const label = e.target.parentElement;

        // Calculate the bounding rectangles of the label and root elements
        const labelRect = label.getBoundingClientRect();
        const containerRect = containerEle.getBoundingClientRect();

        const containerPaddingLeft = parseInt(window.getComputedStyle(containerEle).paddingLeft, 10);
        const left = labelRect.left - containerRect.left - containerPaddingLeft;

        selectedEle.style.width = `${label.clientWidth}px`;
        selectedEle.style.transform = `translateX(${left}px)`;

        const selectedLabel = containerEle.querySelector(".radio-switch__label--selected");
        if (selectedLabel) {
          selectedLabel.classList.remove("radio-switch__label--selected");
        }
        label.classList.add("radio-switch__label--selected");
      };

      [...containerEle.querySelectorAll(".radio-switch__input")].forEach((radioEle, index) => {
        radioEle.addEventListener("click", (e) => {
          handleSelectRadio(e);
        });
      });
    });

    return (
      <div className="flex">
        <div class={"radio-switch"} id={id.current}>
          {data?.map((d) => (
            <label class="radio-switch__label">
              <input type="radio" class="radio-switch__input" name={id.current} />
              {d}
            </label>
          ))}
          <div class="radio-switch__selected" id={"selectedIndicator" + id.current}></div>
        </div>
      </div>
    );
  };

  async function makePayment() {
    let res = await fetch("https://ab498.pythonanywhere.com/getpaymenturl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: persist.current.lastGenerateId,
      }),
    });
  }
  return (
    <div className="w-full h-full flex flex-col items-center   ">
      <div className="nav shrink-0 flex items-center px-4 gap-4 h-20 w-full ">
        <div className="flex max-w-4xl full mx-auto items-center">
          <img class="logo h-12 rounded object-contain" src="logo.jpg" alt="" />
          <div className="grow"></div>
          <label for="theme-toggle" class="relative h-8 w-14 cursor-pointer rounded-full bg-gray-300 transition has-[:checked]:bg-zinc-600">
            <input defaultChecked={localStorage.theme == "dark"} type="checkbox" id="theme-toggle" class="peer sr-only peer" onChange={(e) => darkModeSwitch(e.target.checked)} />
            <span class="absolute inset-y-0 start-0 m-1 size-6 rounded-full bg-white peer-checked:bg-zinc-900 transition-all peer-checked:start-6"></span>
          </label>
        </div>
      </div>

      <div className="subnav bg-neutral-100 dark:bg-[#15191E] shrink-0 flex items-center px-4 gap-4 w-full justify-center p-2">
        <div className="bg-green-400 p-1 px-4 rounded flex items-center gap-2">
          <i className="flex fi fi-rr-paper-plane-top"></i>
          <div className="text-xl">NEWS</div>
        </div>
        <div className="bg-green-400 p-1 px-4 rounded flex items-center gap-2">
          <i className="flex fi fi-rr-question"></i>
          <div className="text-xl">FAQ</div>
        </div>
      </div>

      <div className="main flex flex-col w-full full ">
        <div className="flex flex-col max-w-6xl w-full mx-auto  p-4 ">
          {/* <AsyncComponent resolvers={{ count: async () => 1 }}>{Test}</AsyncComponent> */}
          <div className="flex flex-col max-w-6xl w-full mx-auto p-4">
            <div className="flex full gap-4">
              <CustomSelect
                label={"Country"}
                value={state.current.currentCountry}
                onChange={(d) => (state.current.currentCountry = d)}
                data={{
                  render: (d) => (
                    <div className="flex items-center gap-2 p-2 hover-effect">
                      <img src={d.icon} className="w-6 h-6" alt="" />
                      <div>{d.name}</div>
                    </div>
                  ),
                  options: [
                    { name: "United States", icon: "/images/united-states.png" },
                    { name: "United Kingdom", icon: "/images/united-kingdom.png" },
                  ],
                }}
              />
              <CustomSelect
                label={"Document Type"}
                value={state.current.currentDocSlug}
                onChange={(d) => (state.current.currentDocSlug = options.find((o) => o.name == d).slug)}
                data={{
                  render: (d) => (
                    <div className="flex items-center gap-2 p-2 hover-effect">
                      {/* <img src={d.icon} className="w-6 h-6" alt="" /> */}
                      <i className="flex fi fi-rr-user"></i>
                      <div>{d.name}</div>
                    </div>
                  ),
                  options: optionsForCountry(state.current.currentCountry),
                }}
                className={!state.current.currentCountry ? "special-disabled" : ""}
              />
            </div>
          </div>

          {(() => {
            if (doc) {
              return (
                <div className="flex full flex-wrap ">
                  <div className="flex flex-col info-input  basis-full sm:basis-2/3 h-full ">
                    <div className="text-2xl font-semibold">{doc.name}</div>
                    <div className="flex border-t gap-2 py-2">
                      <CustomRadio data={["Male", "Female"]} />
                      <CustomRadio data={["Scan", "Photo", "Raw"]} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {doc.fields.map((field) => (
                        <div className="flex flex-col">
                          <div className="font-semibold truncate ">{field.input_label}</div>
                          <input
                            type="text"
                            className={"rounded min-w-[100px]  p-2 bg-neutral-100 dark:bg-[#393D46] border focus:shadow-[0_0_10px_2px] focus:shadow-white/50 form-input " + field.input_name}
                            placeholder={field.input_placeholder}
                            name={field.input_name}
                          />
                          <div className="error text-red-500 text-sm "></div>
                        </div>
                      ))}
                    </div>

                    <div className="grow"></div>
                    <div className="my-6"></div>
                  </div>
                  <div className="flex flex-col photo-input  basis-full sm:basis-1/3">
                    <div className="flex flex-col gap-2 p-2">
                      <div className="font-semibold">Photo</div>
                      <img className="h-64 object-contain  rounded upload-image" src="no-image.png" alt="" />
                      <div className="flex gap-2">
                        <div className="special-btn file-name grow">[No File]</div>
                        <label className="special-btn">
                          Upload
                          <input
                            type="file"
                            className={"form-input photo hidden"}
                            onChange={(e) => {
                              e.target.parentElement.parentElement.querySelector(".file-name").textContent = e.target.files[0].name;
                              e.target.parentElement.parentElement.parentElement.querySelector(".upload-image").src = URL.createObjectURL(e.target.files[0]);
                            }}
                          />
                        </label>
                      </div>
                      <div className="special-btn">Random</div>
                    </div>
                    <div className="flex flex-col gap-2 p-2">
                      <div className="font-semibold">Signature</div>
                      <img className="h-32 object-contain  rounded upload-image" src="no-image.png" alt="" />
                      <div className="flex gap-2">
                        <div className="special-btn file-name grow">[No File]</div>
                        <label className="special-btn">
                          Upload
                          <input
                            type="file"
                            className={"form-input signature hidden"}
                            onChange={(e) => {
                              e.target.parentElement.parentElement.querySelector(".file-name").textContent = e.target.files[0].name;
                              e.target.parentElement.parentElement.parentElement.querySelector(".upload-image").src = URL.createObjectURL(e.target.files[0]);
                            }}
                          />
                        </label>
                      </div>
                      <div className="special-btn">Random</div>
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="center flex-col sm:flex-row">
                  <div className="p-10 flex flex-col items-center">
                    <i className="fi fi-rr-flag text-5xl p-6"></i>
                    <div className="text-2xl font-semibold text-center">Select Country and Type</div>
                  </div>
                  <i className="fi fi-rr-arrow-down sm:hidden text-5xl"></i>
                  <i className="fi fi-rr-arrow-right hidden sm:block text-5xl"></i>
                  <div className="p-10 flex flex-col items-center">
                    <i className="fi fi-rr-form text-5xl p-6"></i>
                    <div className="text-2xl font-semibold text-center">Fill in forms</div>
                  </div>
                  <i className="fi fi-rr-arrow-down sm:hidden text-5xl"></i>
                  <i className="fi fi-rr-arrow-right hidden sm:block text-5xl"></i>
                  <div className="p-10 flex flex-col items-center">
                    <i className="fi fi-rr-document text-5xl p-6"></i>
                    <div className="text-2xl font-semibold text-center">Generate Documents</div>
                  </div>
                </div>
              );
            }
          })()}
          <div className=" flex flex-col result bg-neutral-100 dark:bg-[#393D46] rounded p-4 min-h-[300px]">
            <div className="text-2xl font-semibold">Results</div>
            <div className="center flex flex-col  grow">
              {(() => {
                if (generationProgress.current.status == "running")
                  return (
                    <div class="w-full h-full rounded center text-xl flex flex-col gap-4 grow ">
                      <Spinner />
                      <div>Loading...</div>
                    </div>
                  );
                else if (generationProgress.current.status == "failed") return <div class="w-full h-full rounded center text-xl">Preview Not Available!</div>;
                else if (generationProgress.current.status == "completed") return <img src={state.current.resultUrl} alt="" className="h-64 object-contain rounded overflow-hidden" />;
                else return <img src={state.current.previewImage} alt="" className="full object-contain rounded overflow-hidden" />;
              })()}
            </div>
            <div className="my-2"></div>
            <div className="flex center">
              <div className="special-btn" onClick={() => makePayment()}>
                Proceed to Payment
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="my-2"></div>
      <div className="sticky bottom-0 h-16 w-full flex justify-center items-center border-t border-t-gray-500 bg-white dark:bg-[#1C232A]">
        <div className="special-btn" onClick={() => generateAndShow()}>
          Generate Photo
        </div>
      </div>
    </div>
  );
};
let CustomSelect = ({ label, data, onChange, value, className }) => {
  let selected = reactive(null);
  let modalOpen = reactive(0);
  return (
    <CustomPopup
      open={modalOpen}
      render={
        <SearchableList
          data={data}
          value={selected.current}
          onChange={(d) => {
            selected.current = d;
            modalOpen.current = 0;

            onChange(d);
          }}
        />
      }
    >
      <div className={`flex center ${className}`}>
        <div className="flex items-center special-btn" onClick={() => (modalOpen.current = 1)}>
          <div className="font-semibold min-w-[100px]"> {selected.current || label || "Select"}</div>
          <div className="grow"></div>
          <i class="flex fi-rr-expand-arrows-alt"></i>
        </div>
      </div>
    </CustomPopup>
  );
};
let SearchableList = ({ data, onChange }) => {
  return (
    <div className="card p-2">
      <input type="text" className="min-w-[300px] border p-2 bg-neutral-100 dark:bg-neutral-900" placeholder="Search..." />
      <div className="flex flex-col py-2">
        {/* {data?.[0] && typeof data[0] == "string"
          ? data.map((d) => (
              <div
                className="hover-effect p-2 rounded"
                onClick={() => {
                  // selected.current = d;
                  onChange(d);
                }}
              >
                {d}
              </div>
            ))
          : */}
        {data.options.map((d) => {
          let El = data.render(d);
          return (
            <div onClick={() => onChange(d.name)}>
              <El.type {...El.props} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

let { useFloating, autoUpdate, offset, flip, shift, useHover, useFocus, useDismiss, useRole, useClick, useClientPoint, useInteractions, FloatingOverlay } = window.FloatingUIReact;

let CustomPopup = ({ children, render, open = false }) => {
  const [isOpen, setIsOpen] = useState(open.current);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setIsOpen(open.current);
    cons("open.current", open.current);
  }, [open.current]);
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      flip(),
      shift({
        crossAxis: true,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });
  const click = useClick(context);

  // Merge all the interactions into prop getters
  const { getReferenceProps, getFloatingProps } = useInteractions([click]);

  return (
    <div className="relative">
      {children && <children.type {...children.props} ref={refs.setReference} {...getReferenceProps()} />}
      {!!isOpen && (
        <div>
          {isOpen && <div className="overscroll-auto z-10 fixed w-screen h-screen bg-black/50 top-0 left-0" onClick={() => setIsOpen(false)}></div>}
          <div className="z-20 flex flex-col max-h-[80vh] " ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
            {render}
          </div>
        </div>
      )}
    </div>
  );
};
function CustomModal({ children, render, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    isOpen && (
      <div className="fixed top-0 left-0 w-screen h-screen p-2  flex items-center justify-center z-10">
        <div className="absolute w-full h-full bg-black/50 top-0 left-0 hover:bg-blue-700/50" onClick={() => setIsOpen(false)}></div>
        <div class="z-10">{render}</div>
      </div>
    )
  );
}

function Test(params) {
  return <div>{params?.count || "none"}</div>;
}

window.getIndentityById = getIndentityById;
function findIdentityRecursive(id, root = allOptions.current) {
  if (root.id == id) return root;
  for (let item of [...(root.child || []), ...(root.generator || [])]) {
    let res = findIdentityRecursive(id, item);
    if (res) return res;
  }
}
function getIndentityById(id, root = allOptions.current) {
  if (!root) return null;
  for (let item of allOptions.current) {
    let res = findIdentityRecursive(id, item);
    if (res) return res;
  }
}

const AsyncComponent = ({ children, resolvers, fallback }) => {
  let resolved = useRef({});
  let [available, setAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      await Promise.all(
        Object.entries(resolvers).map(async ([key, resolver]) => {
          resolved.current[key] = await resolver();
        })
      );
      setAvailable(true);
      cons("resolved", resolved.current);
    })();
  }, []);

  return <>{available ? children(resolved.current) : fallback || null}</>;
};

let App = () => {
  let history = useHistory();
  let state = reactive({});
  window.state = state;
  let persist = reactivePersist("persist", {});
  window.persist = persist;

  useEffect(() => {
    cons("persist", persist);
  }, []);

  window.navigate = (...args) => {
    if (typeof args[0] == "number") return history.go(args[0]);
    history.push(args[0]);
  };

  let [uid, setUid] = useState(uuid());
  window.persist = persist;
  return (
    <div className="bg-neutral-50 dark:bg-[#1C232A] text-neutral-800 dark:text-neutral-200 ">
      <GeneratorPage />
      {/* <DBControl /> */}
    </div>
  );
};

function renderApp() {
  window.time = Date.now();
  ReactDOM.render(
    <BrowserRouter>
      <App></App>
    </BrowserRouter>,
    document.getElementById("root")
  );
  console.log("Rendered App in:", new Date(Date.now() - window.time).getMilliseconds() + "ms");

  window.dispatchEvent(new CustomEvent("appReady", { detail: true }));
}

watchFiles(["/", "main.jsx"], fetchAndReload);

renderApp();
