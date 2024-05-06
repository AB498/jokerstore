// react specific
const { useState, useEffect, useRef, createContext, useContext, useMemo, isValidElement } = React;
const { BrowserRouter, Link, Route, Routes, Switch, useHistory, useLocation, useParams, useRouteMatch } = ReactRouterDOM;
function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => Object.fromEntries([...new URLSearchParams(search)]), [search]); // q.get("name")
}
const useBeforeMount = (func) => {
  const hasMounted = React.useRef(false);
  if (!hasMounted.current) {
    func();
    hasMounted.current = true;
  }
};
function makeReactive(obj, setter) {
  let mutatingArrayFunctions = ["copyWithin", "fill", "pop", "push", "reverse", "shift", "sort", "splice", "unshift"];
  let handler = {
    get: function (target, prop) {
      if (prop == "__isReactive") return true;
      return target[prop];
    },
    set: function (target, prop, value) {
      target[prop] = value;
      target[prop] = makeReactive(value, setter);
      // console.log("set", prop, value, target);
      if (!prop.startsWith("_")) setter();
      return true;
    },
  };
  if (!isJSONObject(obj) && !Array.isArray(obj)) {
    return obj;
  }
  let newObj = {};
  if (Array.isArray(obj)) {
    newObj = [];
  }
  for (const [key, value] of Object.entries(obj)) {
    newObj[key] = makeReactive(value, setter);
  }
  return new Proxy(newObj, handler);
}

let reactive = (obj) => {
  let [state, setState] = useState(obj);
  let ref = useRef(state);
  ref.current = state;
  let setter = () => setState(ref.current);
  ref.current = makeReactive(ref.current, setter);
  return new Proxy(ref, {
    get: function (target, prop) {
      if (prop == "__isReactive") return true;
      return target[prop];
    },
    set: function (target, prop, value) {
      target[prop] = value;
      target[prop] = makeReactive(value, setter);
      if (prop == "current") setter();
      return true;
    },
  });
};
let reactivePersist = (keyToSaveTo, obj, override = false) => {
  let val = safeParse(localStorage.getItem(keyToSaveTo)) || obj || {};
  let [state, setState] = useState(override ? obj : val);
  let ref = useRef(state);
  ref.current = state;
  let setter = () => setState(ref.current);
  ref.current = makeReactive(ref.current, setter);
  // ref.original = state;
  useEffect(() => {
    // cons("changed setiing", state, ref.current);
    localStorage[keyToSaveTo] = safeStringify(ref.current);
  }, [state]);
  return new Proxy(ref, {
    get: function (target, prop) {
      if (prop == "__isReactive") return true;
      return target[prop];
    },
    set: function (target, prop, value) {
      target[prop] = value;
      target[prop] = makeReactive(value, setter);
      if (prop == "current") setter();
      return true;
    },
  });
};
let original_useEffect = window.original_useEffect || React.useEffect;
let mod_useEffect = (...args) => {
  if (funcType(args[0]) == "async") {
    return original_useEffect(() => {
      args[0]();
    }, args.slice(1));
  }
};

let original_createElement = window.original_createElement || React.createElement;
let mod_createElement = (...args) => {
  return original_createElement(...args);
  if (args[2] && typeof args[2] == "object" && !args[2]["$$typeof"] && !args[2].some((v) => v?.["type"]) && !isValidElement(args[2])) {
    // console.log("object", args[2]);
    if (!(Array.isArray(args[2]) && args[2].every((v) => !v)))
      return (args[2] = (
        <div class="flex flex-col  border border-blue-400 m-1 font-mono">
          <label class="peer cursor-pointer text-xs bg-blue-400 text-white hover:bg-blue-300">
            <input type="checkbox" name="show" id="" class="hidden" />
            <div class="">JSON Object</div>
          </label>
          <div class="peer-has-[:checked]:hidden">
            {/*<pre class="overflow-auto whitespace-pre-wrap bg-white text-black dark:bg-black dark:text-white ">{safeStringify(args[2])}</pre>
                <SpecialJSON data={args[2]} />
                 */}
            {<CustomJSON data={args[2] || { VALUE: "NULL" }} />}
          </div>
        </div>
      ));
  }
  if (
    args?.[0] &&
    args?.[0]?.name &&
    !(funcType(args[0]) == "class") &&
    args[0].name != "FlashChange" &&
    args[0].name != "WithError" &&
    args[0].name != "Funn" &&
    ![...Object.keys(React), ...Object.keys(ReactRouterDOM)].includes(args[0].name)
  ) {
    // let ell = original_createElement(...args);
    return <WithError args={args}></WithError>;
  }
  return original_createElement(...args);
};
React.createElement = mod_createElement;

class WithError extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    // ignore if its FLashChange and about hooks
    let ss = error?.stack
      .toString()
      .split(/\r\n|\n/)
      .slice(1);
    // console.log("ss", ss);
    let isFlashChange = ss.shift();
    while (isFlashChange && !isFlashChange?.includes("FlashChange")) {
      isFlashChange = ss.shift();
    }
    console.log("error?.message", error?.message);
    let total = 5000;
    if (error?.message?.includes("Rendered more hooks than during the previous render") || error?.message?.includes("Rendered fewer hooks than expected")) {
      this.setState({ hasError: false, error, errorInfo, remaining: total });
    } else {
      this.setState({ hasError: true, error, errorInfo, remaining: total });
      (async () => {
        let steps = 51;
        let st = steps;
        while (st--) {
          await new Promise((r) => setTimeout(r, total / steps));
          this.setState({
            ...this.state,
            remaining: (this.state.remaining - total / steps).toFixed(2),
          });
        }
        console.log("error", error);
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          remaining: 0,
        });
      })();
    }
  }

  render() {
    // return <FlashChange remaining={this.state.remaining} hasError={this.state.hasError} errorInfo={this.state.errorInfo} error={this.state.error} args={this.props?.args[0] ? this.props.args : "IS null"}>{this.props.children}</FlashChange>;
    return (this.props.hasError && getErrDiv(this.props.error, this.props.errorInfo?.componentStack)) || <FlashChange args={this.props.args}></FlashChange>;
  }
}
let Funn = ({ args }) => {
  try {
    let Chd = args[0]({ ...args[1], children: args[2] });
    return Chd && <Chd.type {...Chd.props}></Chd.type>;
  } catch (e) {
    return getErrDiv(e, e.stack);
  }
  // cons("args", args, Chd);
};
let FlashChange = (props) => {
  let { args, hasError, error, errorInfo, remaining, Chdd, children } = props;

  let el;
  try {
    el = (hasError && getErrDiv(error, errorInfo?.componentStack)) || <Funn args={args} />;
  } catch (e) {
    console.log(e);
    el = getErrDiv(e, e.stack);
  }
  return <>{el}</>;
};
let getErrDiv = (error, stack) => {
  return (
    <div className="text-xs full border border-red-500 bg-red-100 p-2 ">
      <div className="font-mono">Retrying in {5000}ms</div>
      <pre className="w-full overflow-auto">
        <div className="text-red-500 text-lg font-bold">{error?.toString()}</div>
        <div className="">{stack?.split("\n").slice(0, 5).join("\n") || "Stack finding error"}</div>
      </pre>
    </div>
  );
};

let NotFound = (props) => {
  return (
    <div className="col gap-6 text-emerald-500 text-medium center full py-20">
      Route: {useLocation().pathname}
      <div className="text-4xl text-red-500 center gap-2">
        <i className="fi fi-rr-triangle-warning flex"></i>
        404 Not Found
      </div>
      <div className="flex gap-2">
        <a className="special-btn" onClick={() => navigate("/")}>
          Go Home
        </a>
        <a className="special-btn" onClick={() => navigate(-1)}>
          Go Back
        </a>
      </div>
    </div>
  );
};
// end react specific

let Spinner = () => {
  return (
    <div role="status">
      <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span class="sr-only">Loading...</span>
    </div>
  );
};
function useForceUpdate() {
  const [value, setValue] = React.useState(0) || [0, () => {}]; // integer state
  return () => setValue((value) => value + 1); // update state to force render
}

let CustomJSON = ({ data, onChange }) => {
  let ell = useRef(null);
  let jv = useRef(null);
  const forceUpdate = useForceUpdate();
  useBeforeMount(() => {
    ell.current = document.createElement("div");
    jv.current = new JsonViewer({
      container: ell.current,
      data: safeStringify(data),
      theme: jsonViewerTheme,
      expand: false,
    });
  }, []);
  useEffect(() => {
    // console.log("chdd");
    window.jv = jv.current;
    jv.current.options.data = safeStringify(data);
    jv.current?.render();
  }, [data]);
  return (
    <div>
      <div
        ref={(nodeElement) => {
          nodeElement && nodeElement.replaceWith(ell.current);
        }}
      ></div>
    </div>
  );
};
let SpecialJSON = ({ data, onChange, className, defaultCollapsed = 1 }) => {
  let json = data || {};
  let id = "je" + uuid();
  let editor = useRef(null);
  let [uid, setUid] = useState(uuid());
  let ell = useRef(document.createElement("div"));
  useBeforeMount(() => {
    editor.current = new JSONEditor({
      target: ell.current,
      props: {
        mainMenuBar: false,
        navigationBar: false,
        content: {
          text: undefined,
          json: { ...JSON.parse(JSON.stringify(data || {})) },
        },
        onChange: (updatedContent, previousContent, { contentErrors, patchResult }) => {
          // console.log("onChange", { updatedContent, previousContent, contentErrors, patchResult });
          if (onChange) onChange(updatedContent.json);
          // Object.assign(data, updatedContent.json);
          // data = updatedContent.json;
          // data[Object.keys(data)[0]] = cons(data)[Object.keys(data)[0]];
        },
      },
    });
    ell.current.querySelectorAll(`.jse-main`).forEach((el) => el.classList.remove(...[...el.classList].filter((cls) => cls.startsWith("svelte-"))));
    ell.current.classList.add("border-0");
    if (defaultCollapsed) editor.current.expand((path) => path.length < 1);
    // console.log(ell.getElementById(`${id}`));
  });

  useEffect(() => {
    // console.log("refresh", data);
    if (!editor.current) cons("no editor");
    editor.current.update({
      json: { ...JSON.parse(JSON.stringify(data || {})) },
    });
  }, [data]);

  return (
    <div className="border has-[:focus]:border-red-500">
      <div
        ref={(nodeElement) => {
          nodeElement && nodeElement.replaceWith(ell.current);
        }}
      />
      <div className={`${id} ${className}`}></div>
    </div>
  );
};

let SpecialAccordion = ({ title, children, defaultOpen = false, stylize = false, openTitleClass, open, onChange }) => {
  let id = reactive(uuid()).current;
  return (
    <div class="tab w-full overflow-hidden shrink-0">
      <label class={"peer " + (stylize ? "flex flex-col cursor-pointer bg-gray-100 text-secondary-900 leading-normal" : "")} for={id}>
        <div className="peer flex full items-stretch shrink-0">
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
