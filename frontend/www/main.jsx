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

let Layout = () => {
  return <div>FAQ</div>;
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
let GeneratorPage = () => {
  let generationProgress = reactive({ progress: 0, status: "unstarted" });
  let paymentProgress = reactive({ progress: 0, status: "unstarted" });

  async function generateAndShow() {
    if (!doc.current) {
      console.log("no doc");
      alertify.error("No document selected");
      return;
    }
    generationProgress.current = { progress: 0, status: "running" };

const isValidDate = function(date) {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

    function tryConvertDate(str) {
      try {
        if (!isValidDate(str)) {
          throw new Error('invalid date');
        }
        let res = new Date(str);
        return res;
      } catch (error) {
        console.log('error converting to date', str, error?.message);
      }

      return null;
    }
    function genMrzFromStringMap(stringMap) {
      return generateMrz({
        passport: {
          mrzType: 'td3',
          type: 'p',
          issuingCountry: 'GBR',
          number: stringMap.PASSPORTNO || ' 11av56868',
          expirationDate: stringMap.EXPIRY || '11 May 2021 00:00:00 GMT',

        },
        user: {
          surname: stringMap.SURNAME || 'Gendre',
          givenNames: stringMap.GIVENNAME || 'Pierre Joseh Alexandre',
          nationality: stringMap.NATIONALITY || 'FRA',
          dateOfBirth: cons(tryConvertDate(stringMap.DOB)?.toLocaleString()) || '17 Oct 1986 00:12:00 GMT',
          sex: (stringMap.SEX?.length == 1 ? (stringMap.SEX == 'M' ? 'male' : 'female') : stringMap.SEX) || 'male'
        }
      })
    }
    let fieldResolvers = {
      mrzCalculator1: (stringMap) => {
        let res = genMrzFromStringMap(stringMap);
        return res.split('\n')[0];
      },
      mrzCalculator2: (stringMap) => {
        let res = genMrzFromStringMap(stringMap);
        return res.split('\n')[1];
      }
    }
    try {
      let formData = new FormData();
      let stringMap = { SURNAME: "John Doe", DOB: "01/01/1970" };
      let errors = false;
      console.log("requesting");
      doc.current.data.fields.forEach((item) => {
        let inputEl = document.querySelector(".form-input." + item.input_name);
        if (!inputEl.value && !localStorage.debug) {
          inputEl.parentElement.querySelector(".error").classList.remove("hidden");
          inputEl.parentElement.querySelector(".error").innerHTML = "Please fill this field";
          errors = true;
        } else inputEl.parentElement.querySelector(".error").classList.add("hidden");
        if (!item.type || item.type == "text") stringMap[item.input_name] = inputEl.value || item.input_placeholder;
      });
      doc.current.data.generatedfields?.forEach((item) => {
        stringMap[item.input_name] = fieldResolvers[item.resolver](stringMap);
      });

      console.log('stringMap', stringMap);

      let supportedExts = ["png", "jpg", "jpeg"];
      let imageMap = {};
      for (let i = 0; i < doc.current.data.images.length; i++) {
        let img = doc.current.data.images[i];
        imageMap[i] = img.target_index;
        // console.log((document.querySelector(".form-input." + img.input_name).files[0]))
        let fl = (document.querySelector(".form-input." + img.input_name).files[0]) || await downImage('no-image.png');
        if (fl.name.split('.').pop() && supportedExts.includes(fl.name.split('.').pop())) {
          formData.append("files", fl);
        } else {
          alertify.error("Please upload only images with extensions: " + supportedExts.join(', '));
          errors = true;
        }
      }

      if (errors) {
        generationProgress.current = { progress: 0, status: "unstarted" };
        alertify.error("Please fill all required fields");
        return;
      }

      localStorage.guestUser = localStorage.guestUser || uuid();
      formData.append("bodyString", JSON.stringify({ guestUser: localStorage.guestUser, id: doc.current.data.id, slug: doc.current.slug, stringMap, imageMap }));

      let res = await fetch("api/special/generate-doc", {
        method: "POST",
        body: formData,
      });

      const process = await res.json();
      state.current.currentProcessId = process.processId;
      console.log("got processId", process);
      localStorage.lastProcessId = process.processId;
    } catch (e) {
      console.log(e);
      alertify.error(e.message);
      generationProgress.current = { progress: 0, status: "failed", };
    }
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

  async function fetchAndShow(processId, withoutOverlay = false) {
    if (!processId) return (state.current.resultUrl = null);
    try {
      let tmp = await poll(async () => {
        let res = await (await fetch("api/special/generate-doc-status/" + processId)).json();
        cons("result status", res?.status, res?.result, res?.error);
        return res.status == "completed";
      }, 3000);

      if (tmp?.error) throw new Error(tmp.error);

      let resp = (await (await fetch("api/special/generate-doc-status/" + processId)).json());
      if (resp.error) {
        generationProgress.current = { progress: 0, status: "failed" };
        throw new Error(resp.error);
      }
      let result = resp.result;

      let resImgData = await getImageDataFromUrl("results/" + result.fileName);
      let overlayImgData = await drawText("PREVIEW");
      let protectedImgData = withoutOverlay ? resImgData : await overlayImage(resImgData, overlayImgData);

      state.current.resultUrl = URL.createObjectURL(await ImageDataToBlob(protectedImgData));

      generationProgress.current = { progress: 0, status: "completed" };

      await fetchPaymentStatus(processId);
    } catch (error) {
      console.log(error);
      generationProgress.current = { progress: 0, status: "failed" };
    }
  }
  let countries = reactive([
    { name: "United States", icon: "images/united-states.png" },
    { name: "United Kingdom", icon: "images/united-kingdom.png" },
  ]);
  let options = reactive([]);
  useEffect(() => {
    (async () => {
      options.current = await (await fetch("api/models/document")).json();

      cons(options.current);
    })();
  }, []);
  useEffect(() => {
    if (!state.current.currentProcessId) {
      fetchAndShow(null);
      return;
    }
    (async () => {
      if (state.current.currentProcessId) {
        fetchAndShow(state.current.currentProcessId);
      }
      cons(options.current);
    })();
  }, [state.current.currentProcessId]);
  let doc = reactive(null);

  useEffect(() => {
    if (!state.current.currentDocSlug) return;
    state.current.currentProcessId = null;

    (async () => {
      doc.current = options.current.find((d) => d.slug === state.current.currentDocSlug);
      console.log("doc", doc.current);
    })();
  }, [state.current.currentDocSlug]);

  function optionsForCountry(country) {
    let res = [];
    for (let option of options.current) {
      if (option.country === country) {
        res.push(option);
      }
    }
    return res;
  }

  async function makePayment(processId) {
    try {
      let res = await (await fetch("api/special/get-payment-url/" + state.current.currentProcessId)).json();

      console.log("payment", res, res.paymenturl);

      // window.location.href = res.paymenturl;
      window.open(res.paymenturl, "_blank");

      paymentProgress.current = { progress: 0, status: "running" };

      let tmpProcessId = state.current.currentProcessId;
      let { promise, cancel } = pollWithCancel(async () => {
        if (tmpProcessId != state.current.currentProcessId) {
          cancel();
          paymentProgress.current = { progress: 0, status: "failed" };
          return { error: null, result: true };
        }
        await fetchPaymentStatus(processId);
      }, 3000);

      fetchAndShow(processId, true);

    } catch (e) {
      console.log(e);
      paymentProgress.current = { progress: 0, status: "unstarted" };
    }
  }
  async function fetchPaymentStatus(processId) {
    let res = await (await fetch("api/special/get-payment-status/" + processId)).json();
    console.log("payment status", res?.paymentstatus);
    if (res.error) {
      paymentProgress.current = { progress: 0, status: "failed" };
      return res;
    }
    if (res.paymentstatus === "completed") {
      paymentProgress.current = { progress: 100, status: "completed" };
      return { error: null, result: true };
    } else if (res.paymentstatus === "failed") {
      paymentProgress.current = { progress: 0, status: "failed" };
    }
  }
  return (
    <div className="flex flex-col items-center w-full h-full">
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

      <div className="flex flex-col w-full main full ">
        <div className="flex flex-col w-full max-w-6xl p-4 mx-auto ">
          {/* <AsyncComponent resolvers={{ count: async () => 1 }}>{Test}</AsyncComponent> */}
          <div className="flex flex-col w-full max-w-6xl p-4 mx-auto">
            <div className="flex gap-4 full">
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
                  options: countries.current,
                }}
              />
              <CustomSelect
                label={"Document Type"}
                value={state.current.currentDocSlug}
                onChange={(d) => (state.current.currentDocSlug = options.current.find((o) => o.name == d).slug)}
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
            if (doc.current) {
              return (
                <div className="flex flex-wrap full ">
                  <div className="flex flex-col h-full info-input basis-full sm:basis-2/3 ">
                    <div className="text-2xl font-semibold">{doc.current.name}</div>
                    <div className="flex gap-2 py-2 border-t">
                      <CustomRadio data={["Male", "Female"]} />
                      <CustomRadio data={["Scan", "Photo", "Raw"]} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {doc.current.data.fields.map((field) => (
                        <div className="flex flex-col">
                          <div className="font-semibold truncate ">{field.input_label}</div>
                          <input
                            type="text"
                            className={"rounded min-w-[100px]  p-2 bg-neutral-100 dark:bg-[#393D46] border focus:shadow-[0_0_10px_2px] focus:shadow-white/50 form-input " + field.input_name}
                            placeholder={field.input_placeholder}
                            name={field.input_name}
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
                              e.target.parentElement.parentElement.querySelector(".file-name").textContent = e.target.files[0].name;
                              e.target.parentElement.parentElement.parentElement.querySelector(".upload-image").src = URL.createObjectURL(e.target.files[0]);
                            }}
                          />
                        </label>
                      </div>
                      <div className="special-btn">Random</div>
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
                <div className="flex-col center sm:flex-row">
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
          <div className=" flex flex-col result bg-neutral-100 dark:bg-[#393D46] rounded p-4 min-h-[300px]">
            <div className="flex items-center gap-2 px-2 font-semibold ">
              <i className="flex fi-rr-file"></i>
              <div className="text-2xl">Result</div>
              <div className="grow"></div>
              {state.current.currentProcessId && <div className="text-sm special-link">{"id {" + state.current.currentProcessId + "}"}</div>}
            </div>
            <div className="flex flex-col center grow">
              {(() => {
                if (generationProgress.current.status == "running")
                  return (
                    <div class="w-full h-full rounded center text-xl flex flex-col gap-4 grow ">
                      <Spinner />
                      <div>Loading...</div>
                    </div>
                  );
                else if (generationProgress.current.status == "failed") return <div class="w-full h-full rounded center text-xl">Failed!</div>;
                else if (generationProgress.current.status == "completed")
                  return <img src={state.current.resultUrl} alt="" className="object-contain h-64 overflow-hidden rounded" />;
                else
                  return state.current.previewImage ? (
                    <img src={state.current.previewImage} alt="" className="object-contain h-64 overflow-hidden rounded" />
                  ) : (
                    <div
                      className="text-lg special-btn"
                      onClick={async () => {
                        state.current.previewImage = URL.createObjectURL(await (await fetch("/api/special/get-random-doc")).blob());
                      }}
                    >
                      Show Random
                    </div>
                  );
              })()}
            </div>
            <div className="my-4"></div>
            <div className="flex center">
              {(() => {
                if (!state.current.currentProcessId || generationProgress.current.status != "completed") {
                  return null;
                }
                if (paymentProgress.current.status == "running")
                  return (
                    <div class="w-full h-full rounded center text-xl flex flex-col gap-4 grow ">
                      <Spinner />
                      <div>Loading...</div>
                    </div>
                  );
                else if (paymentProgress.current.status == "failed") return <div class="w-full h-full rounded center text-xl">Payment Failed! Retry</div>;
                else if (paymentProgress.current.status == "completed") return <div class="w-full h-full rounded center text-xl">Payment Successful!</div>;
                else
                  return (
                    <div className="special-btn" onClick={() => makePayment(state.current.currentProcessId)}>
                      Proceed to Payment
                    </div>
                  );
              })()}
            </div>
          </div>

          <div className="my-4"></div>
          {localStorage.lastProcessId && (
            <div className="">
              <div className="inline font-semibold"> Last Document Id: </div>
              <span
                className="inline special-link"
                onClick={() => {
                  state.current.currentProcessId = localStorage.lastProcessId;
                }}
              >
                {localStorage.lastProcessId} (Click to Load)
              </span>
            </div>
          )}
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
