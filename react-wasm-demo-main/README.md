# React.js and WASM Example

This is an example of how to integrate WebAssembly (WASM) into a React.js project. The integration process allows you to use WASM modules for faster execution of code in the browser, providing an enhanced user experience.

TL/DR need to see demo in action: [barKoder React WASM Demo](https://dev2.afk.mk/react-wasm-demo/build/).

## Features

- **Barcode Scanning**: Scan a wide variety of barcodes (1D, 2D) including QR codes, UPC, Code 128, and more.
- **Camera Selection**: Select the active camera and adjust camera settings such as resolution and scanning speed.
- **Template Selection**: Use predefined templates (like "All Barcodes" or "QR Barcodes") to simplify barcode type selection.
- **MultiScan**: Toggle between single and multi-scan modes to scan multiple barcodes at once.
- **Notifications**: Receive notifications of scan results and manage the display of scan history.
- **CSV Export**: Export scan results to a CSV file for further processing.
- **Copy**: Copy barcode result to clipboard.
- **Search**: Search scanned barcode on google.
- **Real-Time Feedback**: Display the scanned barcode result in real-time with visual overlays.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or above)
- npm (v6 or above)


## Project Setup (Installation)

Follow the steps below to set up and run this project:

### 1. Clone the Repository

Start by cloning the repository to your local machine:

```bash
git clone <repository_url>
cd <project_folder>
npm install
npm run-script build
npm start
```


## Implementation

```bash
npx create-react-app app-name
cd app-name
npm install barkoder-wasm
```

### index.js file:

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import SampleApp from "./sampleapp";
import './main.css'

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<SampleApp />);
```

### sampleapp.js:

```javascript
import React, { useState, useEffect, useMemo } from "react";
import BarkoderSDK from "barkoder-wasm";

const [isInitialized, setIsInitialized] = useState(false);
const [Barkoder, setBarkoder] = useState(null);
const [templateData, setTemplateData] = useState({});
const [barcodesData, setBarcodesData] = useState({});
const [cameras, setCameras] = useState([]);
const [selections, setSelections] = useState({
    check_all: false,
    active_camera: "",
    barcode_type: "1d",
    enabledDecoders: 0,
    syms: [],
    template: "all",
    speed: 1,
    camera_res: 0,
    dps: 28,
    isMultiscanEnabled: true,
    isContinuousEnabled: true,
  });
  const [flags, setFlags] = useState({
    mode: "initial",
    showBox: "",
    showResultBox: false,
    cammeraRunning: false,
    cammeraLoading: false,
  });

const readTemplate = async () => {
  try {
    const response = await fetch(`templates.json`);
    const data = await response.json();
    setTemplateData(data);
  } catch (error) {
    console.error("Error loading template:", error);
  }
};

 useEffect(() => {
    const initializeBarkoder = async () => { 
      const Barkoder = await BarkoderSDK.initialize("YOUR_LICENCE_KEY");
      setIsInitialized(true);
      Barkoder.setEnabledDecoders(
        Barkoder.constants.Decoders.QR,
        Barkoder.constants.Decoders.QRMicro,
        Barkoder.constants.Decoders.Code128,
        Barkoder.constants.Decoders.Code93,
        Barkoder.constants.Decoders.Code39,
        Barkoder.constants.Decoders.Codabar,
        Barkoder.constants.Decoders.Code11,
        Barkoder.constants.Decoders.Ean8,
        Barkoder.constants.Decoders.Ean13,
        Barkoder.constants.Decoders.Msi,
        Barkoder.constants.Decoders.UpcA,
        Barkoder.constants.Decoders.UpcE,
        Barkoder.constants.Decoders.PDF417,
        Barkoder.constants.Decoders.Databar14,
        Barkoder.constants.Decoders.DatabarLimited,
        Barkoder.constants.Decoders.DatabarExpanded,
        Barkoder.constants.Decoders.PostalIMB,
        Barkoder.constants.Decoders.Postnet,
        Barkoder.constants.Decoders.Planet,
        Barkoder.constants.Decoders.AustralianPost,
        Barkoder.constants.Decoders.RoyalMail,
        Barkoder.constants.Decoders.KIX,
        Barkoder.constants.Decoders.JapanesePost
      );
      Barkoder.setFlashEnabled(false)
      Barkoder.setZoomEnabled(false)
      Barkoder.setCloseEnabled(false)
      Barkoder.setCameraPickerEnabled(false)
      Barkoder.setCameraResolution(Barkoder.constants.CameraResolution.FHD);
      Barkoder.setDecodingSpeed(Barkoder.constants.DecodingSpeed.Normal);
      Barkoder.setContinuous(true);
      setBarkoder(Barkoder);
      const allCameras = await Barkoder.getCameras();
      setCameras((prev) => [
        ...prev,
        ...allCameras 
      ]);
    };
    initializeBarkoder();
  }, []);

useEffect(() => {
  const fetchData = async () => {
    await readTemplate();
    setTemplateData("all");
  };
  fetchData();
}, []);

useEffect(() => {
    if (Barkoder) {
      const updateBarcodesData = () => {
        const decoders = {
          [Barkoder.constants.Decoders.Aztec]: { title: "Aztec", type: "2d" },
          [Barkoder.constants.Decoders.AztecCompact]: { title: "Aztec Compact", type: "2d" },
          [Barkoder.constants.Decoders.QR]: { title: "QR Code", type: "2d" },
          [Barkoder.constants.Decoders.QRMicro]: { title: "Micro QR Code", type: "2d" },
          [Barkoder.constants.Decoders.Code128]: { title: "Code 128", type: "1d" },
          [Barkoder.constants.Decoders.Code93]: { title: "Code 93", type: "1d" },
          [Barkoder.constants.Decoders.Code39]: { title: "Code 39", type: "1d" },
          [Barkoder.constants.Decoders.Codabar]: { title: "Codabar", type: "1d" },
          [Barkoder.constants.Decoders.Code11]: { title: "Code 11", type: "1d" },
          [Barkoder.constants.Decoders.Msi]: { title: "MSI Plessey", type: "1d" },
          [Barkoder.constants.Decoders.UpcA]: { title: "UPC A", type: "1d" },
          [Barkoder.constants.Decoders.UpcE]: { title: "UPC E", type: "1d" },
          [Barkoder.constants.Decoders.UpcE1]: { title: "UPC E1", type: "1d" },
          [Barkoder.constants.Decoders.Ean13]: { title: "EAN 13", type: "1d" },
          [Barkoder.constants.Decoders.Ean8]: { title: "EAN 8", type: "1d" },
          [Barkoder.constants.Decoders.PDF417]: { title: "PDF417", type: "2d" },
          [Barkoder.constants.Decoders.PDF417Micro]: { title: "Micro PDF417", type: "2d" },
          [Barkoder.constants.Decoders.Datamatrix]: { title: "Data Matrix", type: "2d" },
          [Barkoder.constants.Decoders.Code25]: { title: "Code 25", type: "1d" },
          [Barkoder.constants.Decoders.Interleaved25]: { title: "Interleaved 2 of 5", type: "1d" },
          [Barkoder.constants.Decoders.ITF14]: { title: "ITF-14", type: "1d" },
          [Barkoder.constants.Decoders.IATA25]: { title: "Code 2 of 5 IATA", type: "1d" },
          [Barkoder.constants.Decoders.Matrix25]: { title: "Code 2 of 5 Matrix", type: "1d" },
          [Barkoder.constants.Decoders.Datalogic25]: { title: "Code 2 of 5 Datalogic", type: "1d" },
          [Barkoder.constants.Decoders.COOP25]: { title: "Code 2 of 5 Standard", type: "1d" },
          [Barkoder.constants.Decoders.Code32]: { title: "Code 32", type: "1d" },
          [Barkoder.constants.Decoders.Telepen]: { title: "Telepen", type: "1d" },
          [Barkoder.constants.Decoders.Dotcode]: { title: "DotCode", type: "2d" },
          [Barkoder.constants.Decoders.Databar14]: { title: "Databar 14", type: "1d" },
          [Barkoder.constants.Decoders.DatabarLimited]: { title: "Databar Limited", type: "1d" },
          [Barkoder.constants.Decoders.DatabarExpanded]: { title: "Databar Expanded", type: "1d" },
          [Barkoder.constants.Decoders.PostalIMB]: { title: "Postal IMB", type: "1d" },
          [Barkoder.constants.Decoders.Postnet]: { title: "Postnet", type: "1d" },
          [Barkoder.constants.Decoders.Planet]: { title: "Planet", type: "1d" },
          [Barkoder.constants.Decoders.AustralianPost]: { title: "Australian Post", type: "1d" },
          [Barkoder.constants.Decoders.RoyalMail]: { title: "Royal Mail", type: "1d" },
          [Barkoder.constants.Decoders.KIX]: { title: "KIX", type: "1d" },
          [Barkoder.constants.Decoders.JapanesePost]: { title: "Japanese Post", type: "1d" },
        };

        const updatedBarcodesData = {};
  
        Object.entries(decoders).forEach(([key, value]) => {
          const intKey = parseInt(key, 10);
          updatedBarcodesData[intKey] = value; 
        });
  
       
        setBarcodesData(updatedBarcodesData);
      };
  
      updateBarcodesData();
     
    }
  }, [Barkoder]); 
```

```javascript
const startScanner = () => {
    setIsCameraStarted(true);
    setBarcodesScannedCount(0);

    setFlags((prevFlags) => ({
      ...prevFlags,
      mode: "scanning",
      cammeraLoading: true,
      showResultBox: '',
    }));

    setTimeout(() => {
      if (Barkoder) {
        Barkoder?.startScanner((result) => {
          if (!selections.isMultiscanEnabled && result) {
            setFlags((prevFlags) => ({
              ...prevFlags,
             showStartBtn: true,
            }))
          }
          showResult(result);
        });
      }
    }, 300);  
  };

 const stopScanner = (mode) => {
    Barkoder?.stopScanner();
    setIsCameraStarted(false);
    setFlags((prevFlags) => ({
      ...prevFlags,
      showResultBox: "",
      cammeraRunning: false,
      cammeraLoading: false,
    }));
    if (flags.showResultBox) {
      setFlags((prevFlags) => ({
        ...prevFlags,
        mode: "initial",
        showResultBox: "",
      }));
    }

    if (mode === "restart") {
      setTimeout(() => {
        startScanner();
      }, 400);
    } else {
      setFlags((prevFlags) => ({
        ...prevFlags,
        mode: "initial",
        showBox: "",
      }));
    }
  };

```

```html
<div id="wasmApp">
    <div id="barkoder-container"></div>
    <button className="start_scanner" type="button" onClick={startScanner}>Start Scanner</button>
 	{flags.mode === "scanning" && (
              <button
                className="stop_scanner"
                type="button"
                onClick={stopScanner}
              >
                Stop
              </button>
            )}
</div>
```

```css
#wasmApp {position: fixed;z-index: 99;left: 0;top: 0;width: 100%;height: 100%;}
#barkoder-container {position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color:#FFFFFF; z-index: 1;}
```

## Demo

As mentioned to see this code in action on a live web server you can try [barKoder React WASM Demo](https://barkoder.com/react-wasm-demo/). Works best in Safari on iOS and Chrome on Android. Other main browser are also supported.

## License

[barKoder SDK](https://barkoder.com) uses a license to operate.

Running the barKoder Barcode Scanner SDK without a valid trial or production license will result in all successful barcode scan results being partially masked with asterisks (*). Don't worry, though! You can easily get a trial license by registering on the barKoder Portal and using the self-service [Evaluation License Generation](https://barkoder.com/request-quote).

Each trial license is valid for 30 days and can be used on up to 50 devices.

If you are interested in a Vue.JS build you can check [WASM DEMO](https://github.com/barKoderSDK/barkoder-wasm-demo).


