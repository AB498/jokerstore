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

function removeWhiteBg(imgd) {

  let pix = imgd.data;
  let newColor = { r: 0, g: 0, b: 0, a: 0 };

  for (var i = 0, n = pix.length; i < n; i += 4) {
    var r = pix[i],
      g = pix[i + 1],
      b = pix[i + 2];

    // If its white then change it
    if (r >= 200 && g >= 200 && b >= 200) {
      // Change the white to whatever.
      pix[i] = newColor.r;
      pix[i + 1] = newColor.g;
      pix[i + 2] = newColor.b;
      pix[i + 3] = newColor.a;
    }
  }

  return imgd;

}
function alterPixels(imgd, sourcePixelRange, targetPixel) {

  let pix = imgd.data;
  let newColor = targetPixel;

  for (var i = 0, n = pix.length; i < n; i += 4) {
    var r = pix[i],
      g = pix[i + 1],
      b = pix[i + 2],
      a = pix[i + 3];

    // If its white then change it
    let condition = r >= sourcePixelRange[0].r && g >= sourcePixelRange[0].g && b >= sourcePixelRange[0].b && a >= sourcePixelRange[0].a
      && r <= sourcePixelRange[1].r && g <= sourcePixelRange[1].g && b <= sourcePixelRange[1].b && a <= sourcePixelRange[1].a
    if (condition) {      // Change the white to whatever.
      pix[i] = newColor.r;
      pix[i + 1] = newColor.g;
      pix[i + 2] = newColor.b;
      pix[i + 3] = newColor.a;
    }
  }

  return imgd;

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


let commonLabels = {
  doe: "Date of Expiry",
  doi: "Date of Issue",
  dob: "Date of Birth",
  surname: "Surname",
  givenname: "Given Name",
  number: "Number",
  sex: "Sex",
  nationality: "Nationality",
  dateofissue: "Date of Issue",
  dateofexpiry: "Date of Expiry",
  dateofbirth: "Date of Birth",
  name: "Name",
  documentno: "Document Number",
  address: "Address",
  country: "Country",
  address1: "Address Line 1",
  address2: "Address Line 2",
  city: "City",
  authority: "Authority",
  code: "Code",
  countrycode: "Country Code",
  nationalitycode: "Nationality Code",
}
let commonPlaceholders = {
  doe: "02.05.2025",
  doi: "02.05.2025",
  dob: "02.05.2025",
  surname: "DOE",
  givenname: "JOHN",
  number: "123456789",
  sex: "M or F",
  nationality: "GBR",
  dateofissue: "02.05.2025",
  dateofexpiry: "02.05.2025",
  dateofbirth: "02.05.2025",
  name: "Name",
  documentno: "123456789",
  address: "Address",
  country: "United Kingdom",
  address1: "Address Line 1",
  address2: "Address Line 2",
  city: "City",
  authority: "DVLA",
  code: "GH1F3JE1HRV31",
  countrycode: "GBR",
  nationalitycode: "GBR",
}

function getCommonPlaceholder(label) {
  let res = commonPlaceholders[label.toLowerCase()];
  if (!res) {
    //replace trailing digits and add then after res
    let firsIndexOfNumber = label.toLowerCase().indexOf(/\d+/);
    res = commonPlaceholders[label.toLowerCase().replace(/\d+$/, '')];
    if (!res) return null;
    res += ' ' + label.toLowerCase().slice(firsIndexOfNumber)
    return res
  }
  return res


}

function getCommonLabel(label) {
  let res = commonLabels[label.toLowerCase()];
  if (!res) {
    //replace trailing digits and add then after res
    let firsIndexOfNumber = label.toLowerCase().indexOf(/\d+/);
    res = commonLabels[label.toLowerCase().replace(/\d+$/, '')];
    if (!res) return null;
    res += ' ' + label.toLowerCase().slice(firsIndexOfNumber)
    return res
  }
  return res

}


function formatDDMMYYYY(date) {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
}
function getRandomValue(name) {
  let randomGenerator = {
    doe: () => formatDDMMYYYY(new Date(faker.date.future())),
    doi: () => formatDDMMYYYY(new Date(faker.date.past())),
    dob: () => formatDDMMYYYY(new Date(faker.date.past())),
    surname: faker.person.lastName,
    givenname: faker.person.firstName,
    number: faker.string.numeric,
    sex: faker.person.sexType,
    nationality: () => faker.location.country(),
    dateofissue: () => formatDDMMYYYY(new Date(faker.date.past())),
    dateofexpiry: () => formatDDMMYYYY(new Date(faker.date.future())),
    dateofbirth: () => formatDDMMYYYY(new Date(faker.date.past())),
    name: faker.person.findName,
    documentno: () => faker.string.numeric(9),
    address: faker.location.streetAddress,
    country: () => faker.location.country(),
    address1: faker.location.streetAddress,
    address2: faker.location.streetAddress,
    city: faker.location.city,
    authority: () => faker.location.countryCode('alpha-3'),
    code: faker.string.numeric,
    countrycode: () => faker.location.countryCode('alpha-3'),
    nationalitycode: () => faker.location.countryCode('alpha-3'),
  }

  try {
    return name && randomGenerator[name.toLowerCase()]?.();
  } catch (error) {
    console.log(error)
    console.log(name, typeof name)
    return null;
  }
}
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
          <div className="font-semibold min-w-[100px]"> {selected.current?.name || selected.current || label || "Select"}</div>
          <div className="grow"></div>
          <i class="flex fi-rr-expand-arrows-alt"></i>
        </div>
      </div>
    </CustomPopup>
  );
};
let SearchableList = ({ data, onChange }) => {
  return (
    <div className="p-2 card">
      <input type="text" className="min-w-[300px] border p-2 bg-neutral-100 dark:bg-neutral-900" placeholder="Search..." />
      <div className="flex flex-col py-2">
        {/* {data?.[0] && typeof data[0] == "string"
          ? data.map((d) => (
              <div
                className="p-2 rounded hover-effect"
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
            <div onClick={() => onChange(d)}>
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
          {isOpen && <div className="fixed top-0 left-0 z-10 w-screen h-screen overscroll-auto bg-black/50" onClick={() => setIsOpen(false)}></div>}
          <div className="z-20 flex flex-col max-h-[80vh] " ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
            {render}
          </div>
        </div>
      )}
    </div>
  );
};

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
let SpecialAccordion = ({ title, children, defaultOpen = false, stylize = false, openTitleClass, open, onChange }) => {
  let id = reactive(uuid()).current;
  return (
    <div class="tab w-full overflow-hidden shrink-0">
      <label class={"peer " + (stylize ? "flex flex-col cursor-pointer bg-gray-100 text-secondary-900 leading-normal" : "")} for={id}>
        <div className="flex items-stretch peer shrink-0">
          <input class="peer absolute hidden" id={id} type="checkbox" name="tabs" defaultChecked={defaultOpen} onChange={(e) => (open.current = e.target.checked)} />
          {title}
          <div className="grow"></div>
          {stylize && <i class="px-2  flex self-center fi-rr-angle-down peer-checked:rotate-180 duration-300"></i>}
        </div>
      </label>
      <div
        class={" max-h-0 peer-has-[:checked]:max-h-[900vh] " + (stylize ? "ml-2 border-l-2 border-indigo-500 duration-300 tab-content overflow-hidden leading-normal flex flex-col items-start" : "")}
      >
        {children}
      </div>
    </div>
  );
};

let Support = () => {
  return (
    <div className="flex flex-col items-center w-full h-full min-h-screen">
      <NavBar />
      <div className="flex flex-col w-full main full ">
        <div className="flex flex-col w-full max-w-6xl p-4 mx-auto ">
          <div className="text-4xl font-bold text-yellow-500 ">Support</div>
          <div className="my-4"></div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 px-2 text-lg ">
              <i className="flex fi fi-rr-envelope"></i>
              <div className="font-semibold ">
                Email:{" "}
                <a className="special-link" href="mailto:J0kerst0re@proton.me">
                  J0kerst0re@proton.me
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 px-2 text-lg ">
              <i className="flex fi fi-rr-paper-plane"></i>
              <div className="font-semibold ">
                Telegram:{" "}
                <a className="special-link" href="https://t.me/letsputasmile">
                  https://t.me/letsputasmile
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grow"></div>
      <Footer />
    </div>
  );
};
let FAQ = () => {
  return (
    <div className="flex flex-col items-center w-full h-full min-h-screen">
      <NavBar />
      <div className="flex flex-col w-full main full ">
        <div className="flex flex-col w-full max-w-6xl p-4 mx-auto ">
          <div className="text-4xl font-bold text-yellow-500 ">F.A.Q</div>
          <div className="my-4"></div>
          <div className="flex">
            <div className="flex flex-col gap-4">
              {(() => {
                let features = [
                  [
                    "What is Joker Store",
                    `Jokerstore presents our automated document generator. Simple choose the country and document you require, fill in the required fields, personal info, upload or draw signature, picture etc and click generate. Image will be generated in under 30 seconds. Extremely high DPI, fully editable. 

You also have the ability to choose a custom background/mocap for your document. We provide the best mocaps on the market. 

For passports, we have a free MRZ generator.`,
                  ],
                ];
                return features.map((item, index) => {
                  let open = reactive(false);

                  return (
                    <SpecialAccordion
                      title={
                        <div className={"items-center group relative border-b " + (open.current ? "border-b-yellow-500" : "")} key={index}>
                          <div className="inline text-2xl font-semibold">
                            {open.current ? "▼" : "▶"} {item[0]}
                          </div>
                        </div>
                      }
                      open={open}
                      onChange={(v) => (open.current = v)}
                    >
                      <div className="p-4 ml-4 text-xl whitespace-pre-wrap">{item[1]}</div>
                    </SpecialAccordion>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>
      <div className="grow"></div>
      <Footer />
    </div>
  );
};
let Footer = () => {
  return (
    <div className="w-full h-16 shrink-0 center bg-neutral-200 dark:bg-gray-800">
      <div className="text-lg font-semibold">Copyright © 2024. All Rights Reserved.</div>
    </div>
  );
};
let NavBar = () => {
  return (
    <div className="flex items-center w-full h-20 gap-4 px-4 nav shrink-0 ">
      <div className="flex items-center max-w-4xl mx-auto full">
        <img class="logo h-12 rounded object-contain" src="logo.jpg" alt="" onClick={() => (window.location.href = "/")} />
        <div className="grow"></div>
        <label for="theme-toggle" class="relative h-8 w-14 cursor-pointer rounded-full bg-gray-300 transition has-[:checked]:bg-zinc-600">
          <input defaultChecked={localStorage.theme == "dark"} type="checkbox" id="theme-toggle" class="peer sr-only peer" onChange={(e) => darkModeSwitch(e.target.checked)} />
          <span class="absolute inset-y-0 start-0 m-1 size-6 rounded-full bg-white peer-checked:bg-zinc-900 transition-all peer-checked:start-6"></span>
        </label>
      </div>
    </div>
  );
};



let dynamicFetch = (url, watchers) => {
  let [result, setResult] = useState(null);
  useEffect(() => {
    fetch(url).then((res) => {
      return res.json();
    }).then((res) => {
      setResult(res);
    })
  }, watchers || []);

  return result;
}
let GeneratorPage = () => {
  let documentState = reactive(null); // result
  let infoState = reactive({ doc: null, data: {} }); // input
  let staticState = reactive({ countries: [] });
  let allDocuments = dynamicFetch('/api/models/document');

  let uploadFiles = useRef({});
  window.infoState = infoState;
  window.documentState = documentState;
  window.allDocuments = allDocuments;
  window.uploadFiles = uploadFiles;

  useEffect(() => {
    if (!allDocuments) return;
    console.log('allDocuments', allDocuments);

    let countries = new Set();
    for (let doc of allDocuments) {
      if (doc.country)
        countries.add(doc.country);
    }
    staticState.current.countries = [...countries];
    staticState.current.countries = staticState.current.countries.map((c) => ({ name: c, icon: 'no-image.png' }));
    staticState.current.allDocuments = allDocuments;
  }, [allDocuments])

  useEffect(() => {
    if (!staticState.current.selectedDocument) return;
    console.log('staticState.current.selectedDocument', staticState.current.selectedDocument);
    (async () => {
      infoState.current.doc = await (await fetch(`/docs/${staticState.current.selectedDocument}.json`)).json();
      console.log('infoState.current.doc', infoState.current.doc)
    })()
  }, [staticState.current.selectedDocument])


  async function generateDoc() {
    if (!infoState.current.doc) return;

    console.log("requesting");
    let errors = false;
    let formData = new FormData();

    console.log('stringMap', infoState.current.data);

    let supportedExts = ["png", "jpg", "jpeg"];

    let imgFields = infoState.current.doc.data.fields.filter((f) => f.type == "image");
    let imageMap = {};
    for (let i = 0; i < imgFields.length; i++) {
      let imgField = imgFields[i];
      // image i goes to placeholder imgField.name
      imageMap[i] = imgField.name;
      let file = uploadFiles.current[imgField.name] || await downImage('1x1.png');
      cons('file', i, file)
      formData.append("files", file);


    }

    console.log('imageMap', imgFields, imageMap);


    localStorage.guestUser = localStorage.guestUser || uuid();
    formData.append("bodyString", JSON.stringify({ guestUser: localStorage.guestUser, id: infoState.current.doc.id, slug: infoState.current.doc.slug, stringMap: infoState.current.data, imageMap: imageMap }));

    documentState.current = await (await fetch('/api/special/generate-doc', {
      method: 'POST',
      body: formData,
    })).json();

  }

  function autoFill() {
    if (!infoState.current.doc) return;
    let data = {};
    for (let i = 0; i < infoState.current.doc.data.fields.length; i++) {
      let field = infoState.current.doc.data.fields[i];
      data[field.name] = getRandomValue(field.name) || field.placeholder;
    }
    infoState.current.data = data;
  }

  return (
    <div className="flex flex-col items-center w-full h-full ">
      <NavBar />
      <div className="subnav bg-neutral-100 dark:bg-[#15191E] shrink-0 flex items-center px-4 gap-4 w-full justify-center p-2">
        <div className="flex items-center gap-2 p-1 px-4 bg-green-400 rounded cursor-pointer">
          <i className="flex fi fi-rr-paper-plane-top"></i>
          <div className="text-xl">NEWS</div>
        </div>
        <div className="flex items-center gap-2 p-1 px-4 bg-green-400 rounded cursor-pointer" onClick={() => navigate("/faq")}>
          <i className="flex fi fi-rr-question"></i>
          <div className="text-xl">FAQ</div>
        </div>
        <div className="flex items-center gap-2 p-1 px-4 bg-green-400 rounded cursor-pointer" onClick={() => navigate("/support")}>
          <i className="flex fi fi-rr-envelope"></i>
          <div className="text-xl">Support</div>
        </div>
      </div>

      <div className="flex flex-col w-full min-h-screen main full">
        <div className="flex flex-col w-full max-w-6xl p-4 mx-auto ">
          {/* <AsyncComponent resolvers={{ count: async () => 1 }}>{Test}</AsyncComponent> */}
          <div className="flex flex-col w-full max-w-6xl p-4 mx-auto">
            <div className="flex gap-4 full">

              <div className="flex flex-col">

                <div className="text-sm font-semibold">Country</div>
                <CustomSelect
                  label={"All"}
                  value={state.current.currentCountry}
                  onChange={(d) => (staticState.current.selectedCountry = d.name)}
                  data={{
                    render: (d) => (
                      <div className="flex items-center gap-2 p-2 hover-effect">
                        <i className="flex fi fi-rr-flag"></i>
                        <div>{d.name}</div>
                      </div>
                    ),
                    options: staticState.current.countries || [],
                  }}
                />
              </div>

              <div className="flex flex-col">
                <div className="text-sm font-semibold">Document</div>
                <CustomSelect
                  label={"None"}
                  value={state.current.currentCountry}
                  onChange={(d) => (staticState.current.selectedDocument = d.slug)}
                  data={{
                    render: (d) => (
                      <div className="flex items-center gap-2 p-2 hover-effect">
                        <i className="flex fi fi-rr-user"></i>
                        <div>{d.name}</div>
                      </div>
                    ),
                    options: staticState.current.allDocuments || [],
                  }}
                />

              </div>
            </div>
          </div>

          {(() => {
            if (infoState.current.doc) {
              return (
                <div className="flex flex-wrap full ">
                  <div className="flex flex-col h-full info-input basis-full sm:basis-2/3 ">
                    <div className="text-2xl font-semibold">{infoState.current.doc.name}</div>
                    <div className="flex gap-2 py-2 border-t">
                      <CustomRadio data={["Male", "Female"]} />
                      <CustomRadio data={["Scan", "Photo", "Raw"]} />
                      <div className="special-btn" onClick={() => autoFill()}>Auto Fill Fields</div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {[...infoState.current.doc.data.fields.filter((f) => !f.type || f.type == "text")].map((field) => ( //.sort((a, b) => a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)) 
                        <div className="flex flex-col">
                          <div className="font-semibold truncate ">{getCommonLabel(field.name) || field.label}</div>
                          <input
                            type="text"
                            className={"rounded min-w-[100px]  p-2 bg-neutral-100 dark:bg-[#393D46] border focus:shadow-[0_0_10px_2px] focus:shadow-white/50 form-input " + field.name}
                            placeholder={getCommonPlaceholder(field.name) || field.placeholder}
                            name={field.name}
                            value={infoState.current.data[field.name]}
                            onChange={(e) => (infoState.current.data[field.name] = e.target.value)}
                          />
                          <div className="text-sm text-red-500 error "></div>
                        </div>
                      ))}
                    </div>

                    <div className="grow"></div>
                    <div className="my-6"></div>
                  </div>
                  <div className="flex flex-col overflow-auto photo-input basis-full sm:basis-1/3">
                    <div className="flex flex-col gap-2 p-2">
                      <div className="font-semibold">Photo</div>
                      <img className="object-contain h-64 rounded upload-image" src="no-image.png" alt="" />
                      <div className="flex gap-2">
                        <div className="truncate special-btn file-name grow">[No File]</div>
                        <label className="special-btn">
                          Upload
                          <input
                            type="file"
                            className={"form-input photo hidden"}
                            onChange={(e) => {
                              let blob = e.target.files[0];
                              e.target.parentElement.parentElement.querySelector(".file-name").textContent = e.target.files[0].name;
                              e.target.parentElement.parentElement.parentElement.querySelector(".upload-image").src = URL.createObjectURL(e.target.files[0]);
                              uploadFiles.current["photo"] = blob;
                              console.log('blob', blob)
                            }}
                          />
                        </label>
                      </div>
                      <div className="special-btn" onClick={async (e) => {
                        let blob = await downImage(fakeAvatar());
                        e.target.parentElement.querySelector(".form-input.photo").value = '';
                        e.target.parentElement.querySelector(".upload-image").src = URL.createObjectURL(blob);
                        uploadFiles.current["photo"] = blob;
                        console.log('blob', blob)
                      }}>Random</div>
                    </div>
                    <div className="flex flex-col w-full gap-2 p-2">
                      <div className="font-semibold">Signature</div>
                      <img className="object-contain h-32 rounded upload-image" src="no-image.png" alt="" />
                      <div className="flex w-full gap-2">
                        <div className="truncate special-btn file-name grow">[No File]</div>
                        <label className="special-btn">
                          Upload
                          <input
                            type="file"
                            className={"form-input signature hidden"}
                            onChange={async (e) => {
                              let blob = e.target.files[0];
                              blob = await ImageDataToBlob(await alterPixels(await removeWhiteBg(await getImageDataFromUrl(URL.createObjectURL(blob))), [{ r: 0, g: 0, b: 0, a: 200 }, { r: 255, g: 255, b: 255, a: 255 }], { r: 0, g: 0, b: 0, a: 255 }));
                              e.target.parentElement.parentElement.querySelector(".file-name").textContent = e.target.files[0].name;
                              e.target.parentElement.parentElement.parentElement.querySelector(".upload-image").src = URL.createObjectURL(blob);
                              uploadFiles.current["signature"] = blob;
                            }}
                          />
                        </label>
                      </div>
                      <div className="special-btn" onClick={async (e) => {
                        // form 1 to 15
                        let randNum = Math.floor(Math.random() * 15) + 1;
                        let blob = await downImage('signatures/' + randNum + '.jpg');
                        blob = await ImageDataToBlob(await alterPixels(await removeWhiteBg(await getImageDataFromUrl(URL.createObjectURL(blob))), [{ r: 0, g: 0, b: 0, a: 200 }, { r: 255, g: 255, b: 255, a: 255 }], { r: 0, g: 0, b: 0, a: 255 }));
                        e.target.parentElement.querySelector(".form-input.signature").value = '';
                        e.target.parentElement.querySelector(".upload-image").src = URL.createObjectURL(blob);
                        uploadFiles.current["signature"] = blob;
                      }}>Random</div>
                    </div>
                    <div className="flex flex-col w-full gap-2 p-2">
                      <div className="font-semibold">Background</div>
                      <img className="object-contain h-32 rounded upload-image" src="no-image.png" alt="" />
                      <div className="flex w-full gap-2">
                        <div className="truncate special-btn file-name grow">[No File]</div>
                        <label className="special-btn">
                          Upload
                          <input
                            type="file"
                            className={"form-input background hidden"}
                            onChange={(e) => {
                              let blob = e.target.files[0];
                              e.target.parentElement.parentElement.querySelector(".file-name").textContent = e.target.files[0].name;
                              e.target.parentElement.parentElement.parentElement.querySelector(".upload-image").src = URL.createObjectURL(e.target.files[0]);
                              uploadFiles.current["background"] = blob;
                              console.log('blob', blob)
                            }}
                          />
                        </label>
                      </div>
                      <div className="special-btn" onClick={async (e) => {
                        let blob = await downImage(fakeImage());
                        e.target.parentElement.querySelector(".form-input.background").value = '';
                        e.target.parentElement.querySelector(".upload-image").src = URL.createObjectURL(blob);
                        uploadFiles.current["background"] = blob;
                        console.log('blob', blob)
                      }}>Random</div>
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="flex flex-col items-center sm:flex-row">
                  <div className="flex flex-col items-center p-10">
                    <i className="p-6 text-5xl fi fi-rr-flag"></i>
                    <div className="text-2xl font-semibold text-center">Select Country and Type</div>
                  </div>
                  <i className="text-5xl fi fi-rr-arrow-down sm:hidden"></i>
                  <i className="hidden text-5xl fi fi-rr-arrow-right sm:block"></i>
                  <div className="flex flex-col items-center p-10">
                    <i className="p-6 text-5xl fi fi-rr-form"></i>
                    <div className="text-2xl font-semibold text-center">Fill in forms</div>
                  </div>
                  <i className="text-5xl fi fi-rr-arrow-down sm:hidden"></i>
                  <i className="hidden text-5xl fi fi-rr-arrow-right sm:block"></i>
                  <div className="flex flex-col items-center p-10">
                    <i className="p-6 text-5xl fi fi-rr-document"></i>
                    <div className="text-2xl font-semibold text-center">Generate Documents</div>
                  </div>
                </div>
              );
            }
          })()}

          <DocPreview id={documentState.current?.id} />
        </div>
      </div>

      <div className="my-2"></div>
      <div className="grow"></div>
      <div className="sticky bottom-0 h-16 w-full flex justify-center items-center border-t border-t-gray-500 bg-white dark:bg-[#1C232A]">
        <div className="special-btn" onClick={() => generateDoc()}>
          Generate Document
        </div>
      </div>
    </div>
  );
};


let dynamicPoll = (fn, breakTime = 1000) => {
  let result = reactive(null);
  let cancelled = useRef(false);
  useEffect(() => {
    (async () => {
      while (!cancelled.current) {
        result.current = (await fn());
        await new Promise((resolve) => setTimeout(resolve, breakTime));
      }
    })();

    return () => {
      cancelled.current = true;
    }
  }, []);
  return result;
}
let DocPreview = ({ id }) => {
  let ownId = reactive(id);
  useEffect(() => {
    ownId.current = id;
  }, [id])

  let documentState = dynamicPoll(async () => {
    cons('polling', ownId.current, uuid().slice(0, 2));
    if (!ownId.current) return null;
    try {
      let res = await (await fetch(`/api/special/generate-doc-status/${ownId.current}`)).json();
      return res;
    } catch (error) {
      console.log('preview|generate-doc-status', error);
      return null
    }
  }); // result
  return (
    <div>
      {/* <div>{id || 'No Doc'}</div>
      <div>Result {JSON.stringify(documentState)}</div> */}
      {documentState.current && (
        <div className=" flex flex-col result bg-neutral-100 dark:bg-[#393D46] rounded p-4 min-h-[300px]">
          <div className="flex items-center gap-2 px-2 font-semibold ">
            <i className="flex fi-rr-file"></i>
            <div className="text-2xl">Result</div>
            <div className="grow"></div>
            {id && <div className="text-sm special-link">{"id {" + id + "}"}</div>}
          </div>
          <div className="flex flex-col center grow">
            {(() => {
              if (documentState.current.status == "queued" || documentState.current.status == "running")
                return (
                  <div class="w-full h-full rounded center text-xl flex flex-col gap-4 grow ">
                    <Spinner />
                    <div>Generating...</div>
                    <div>Status: {documentState.current.status}</div>
                  </div>
                );
              else if (documentState.current.status == "failed") return <div class="w-full h-full rounded center text-xl">Failed!</div>;
              else if (documentState.current.status == "completed")
                return <img src={'/results/' + documentState.current.result.fileName} alt="" className="object-contain h-64 overflow-hidden rounded" />;
              else return 'null';
            })()}
          </div>
        </div>
      )}
    </div>
  )
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
      <Switch>
        <Route exact path="/" component={GeneratorPage} />
        <Route exact path="/index.html" component={GeneratorPage} />
        <Route exact path="/faq" component={FAQ} />
        <Route exact path="/support" component={Support} />
      </Switch>
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

if (localStorage.debug)
  watchFiles(["/", "main.jsx"], fetchAndReload);

renderApp();
