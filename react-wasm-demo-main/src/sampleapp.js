import React, { useState, useEffect, useMemo } from "react";
import BarkoderSDK from "barkoder-wasm";
import BarcodeOptions from "./components/BarcodeOptions";
import BarcodeResultBox from "./components/BarcodeResultBox";
import { IoIosFlash, IoIosFlashOff } from "react-icons/io";
import { CiZoomIn, CiZoomOut  } from "react-icons/ci";

const SampleApp = () => {
  const [Barkoder, setBarkoder] = useState(null);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [barcodesScannedCount, setBarcodesScannedCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
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
  const [notifications, setNotifications] = useState([]);
  const [templateData, setTemplateData] = useState({});

  const [barcodesData, setBarcodesData] = useState({});
  const [templateTitles, setTemplateTitles] = useState({
    all: "All Barcodes",
  });
  const templateValues = Object.keys(templateTitles);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFlashAvailable, setIsFlashAvailable] = useState(false)
  const [isZoomAvailable, setIsZoomAvailable] = useState(1) // 1 for FALSE
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [zoomValue, setZoomValue] = useState(1)
  const [scannedBarcodes, setScannedBarcodes] = useState([]);
  const [showStartBtn, setShowStartBtn] = useState(false);

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


  const handleZoom = async () => {
    if (Barkoder) {
      try {
       await Barkoder.changeZoomState();
       setZoomValue((prevValue) => {
        return prevValue === 3 ? 1 : prevValue + 1;
       });
      } catch (error) {
        console.error("Error zooming in/out:", error);
      }
    }
  };

  const handleFlash = async () => {
    setIsFlashOn((prevState) => !prevState);
    if (Barkoder) {
      try {
        await Barkoder.changeFlashState();
      } catch (error) {
        console.error("Error flash on/off:", error);
      }
    }
  };

  const showSingleNotification = (message) => {
    setNotifications([{ textualData: message }]);

    setTimeout(() => {
      setNotifications([]);
    }, 3000);
  };

  const searchResult = () => {
    const search_data = document.getElementById("barcode_description")?.textContent || '';
    if (!search_data) return;
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(
        search_data
      )}`,
      "_blank"
    );
  };

  const copyResult = () => {
    const textToCopy = document.getElementById("barcode_description")?.textContent || '';
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        showSingleNotification("Scan Result copied to clipboard");
      })
      .catch((err) => {
        showSingleNotification("Failed to copy");
      });
  };

  const getBarcodeData = () => {
    const barcodeTitle = document.getElementById("barcode_title")?.textContent || '';
    const barcodeDescription = document.getElementById("barcode_description")?.textContent || '';
    return { barcodeTitle, barcodeDescription };
  };

  const convertToCSV = () => {
    if (scannedBarcodes.length === 0) return '';
  
    const headings = ["Barcode Title", "Barcode Description"];
    const rows = scannedBarcodes.map((barcode) =>
      [barcode.barcodeTitle, barcode.barcodeDescription].map((field) => JSON.stringify(field || "")).join(",")
    );
  
    return [headings.join(","), ...rows].join("\n");
  };
  
  const exportToCSV = () => {
    const csvData = convertToCSV();
    if (csvData.length > 0) {
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
  
      link.setAttribute("href", url);
      link.setAttribute("download", "scanResults.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      showSingleNotification("There is no available data to export!");
    }
  };

  const readTemplate = async () => {
    try {
      const response = await fetch(`templates.json`);
      const data = await response.json();
      setTemplateData(data);
    } catch (error) {
      console.error("Error loading template:", error);
    }
  };

  const showBox = (activeBox) => {
    setFlags((prevFlags) => {
      if (prevFlags.showBox === activeBox) {
        return { ...prevFlags, showBox: "" };
      }
      return { ...prevFlags, showBox: activeBox };
    });
  };

  const changeMultiscanOption = () => {
    setSelections((prevSelections) => {
      const newMultiscanEnabled = !prevSelections.isMultiscanEnabled;
      const newContinuousEnabled = !newMultiscanEnabled;
      const newSelections = {
        ...prevSelections,
        isMultiscanEnabled: newMultiscanEnabled,
        isContinuousEnabled: newContinuousEnabled,
      };

      if (newMultiscanEnabled) {
        Barkoder.setContinuous(true);
        Barkoder.setMulticodeCachingDuration(3000);
        Barkoder.setMulticodeCachingEnabled(
          Barkoder.constants.MulticodeCachingEnabled.Enable
        );
        Barkoder.setMaximumResultsCount(20);
        Barkoder.setDpsLimit(28);
      } else {
        Barkoder.setContinuous(false);
        Barkoder.setMulticodeCachingDuration(0);
        Barkoder.setMulticodeCachingEnabled(
          Barkoder.constants.MulticodeCachingEnabled.Disable
        );
        Barkoder.setMaximumResultsCount(1);
        Barkoder.setDpsLimit(28);
      }
      return newSelections;
    });
  };

  const showResult = (result) => {
    setTimeout(() => {
      Barkoder.setPauseDecoding(false);
    }, 5);
  
    setBarcodesScannedCount((prev) => prev + 1);
    
    if (!result?.selections?.isMultiscanEnabled) {
      showBox("");
    }
  
    setFlags((prevFlags) => ({ ...prevFlags, showResultBox: true }));

  
    // Function to wait until canvas element is available
    const waitForCanvas = (callback) => {
      const canvas = document.getElementById("barkoder-result-image");
      if (canvas) {
        
        callback(canvas);
      } else {
        setTimeout(() => waitForCanvas(callback), 50);
      }
    };
  
    waitForCanvas((canvas) => {
      const barcodeTitleElement = document.getElementById("barcode_title");
      const barcodeDescriptionElement = document.getElementById("barcode_description");
      
  
      if (result.results && Array.isArray(result.results)) {
        const barcode = result.results[0].capturedBarcode;
    
        if (canvas) {
          var ctx = canvas.getContext("2d");
          canvas.width = barcode.width;
          canvas.height = barcode.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.putImageData(barcode, 0, 0);
        }
    
        if (barcodeTitleElement) {
          barcodeTitleElement.textContent = result.results[0].barcodeTypeName;
        }
    
        if (barcodeDescriptionElement) {
          barcodeDescriptionElement.textContent = result.results[0].textualData;
        }
    
      } else {
       
        if (canvas) {
          var ctx = canvas.getContext("2d");
          canvas.width = result.capturedBarcode.width;
          canvas.height = result.capturedBarcode.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.putImageData(result.capturedBarcode, 0, 0);
        }
  
        if (barcodeTitleElement) {
          barcodeTitleElement.textContent = result.barcodeTypeName;
        }
  
        if (barcodeDescriptionElement) {
          barcodeDescriptionElement.textContent = result.textualData;
        }

        setShowStartBtn(true)
      }
    });
  };
  
  
  
  const handleCameraChange = (cameraId) => {
    setFlags((prevFlags) => ({
      ...prevFlags,
      showBox: ""
    }))
    if (selections.active_camera !== cameraId) {
      setSelections((prevSelections) => ({
        ...prevSelections,
        active_camera: cameraId,
      }));
      Barkoder.setCameraId(cameraId);
      stopScanner("restart");
    }
  };

  const swipeHideResultSection = () => {
    let touchStartY = 0;
    let touchEndY = 0;
    const swipeThreshold = 50;

    const handleSwipe = () => {
      let swipeDistance = touchEndY - touchStartY;
      if (swipeDistance > swipeThreshold) {
        if (isExpanded) {
          setIsExpanded(false);
        } else {
          setFlags((prevFlags) => ({
            ...prevFlags,
            showResultBox: false,
          }));
        }
      }
      if (swipeDistance < -swipeThreshold) {
        setIsExpanded(true);
      }
    };

    const swipeArea = document.querySelector(".resultContainer");
    if (swipeArea) {
      const onTouchStart = (event) => {
        touchStartY = event.changedTouches[0].screenY;
      };

      const onTouchEnd = (event) => {
        touchEndY = event.changedTouches[0].screenY;
        handleSwipe();
      };

      swipeArea.addEventListener("touchstart", onTouchStart);
      swipeArea.addEventListener("touchend", onTouchEnd);

      return () => {
        swipeArea.removeEventListener("touchstart", onTouchStart);
        swipeArea.removeEventListener("touchend", onTouchEnd);
      };
    }
  };

  const toggleExpand = () => {
    setIsExpanded((prevState) => !prevState);
  };

  const startScanner = () => {
   
    setIsCameraStarted(true);
    setBarcodesScannedCount(0);

    setFlags((prevFlags) => ({
      ...prevFlags,
      mode: "scanning",
      cammeraLoading: true,
      showResultBox: '',
    }));

    setShowStartBtn(false)

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
          const newNotification = { 
            id: Date.now(), 
            textualData: result.textualData 
          };
          setNotifications(prevNotifications => [
            ...prevNotifications,
            newNotification
          ]);
          setTimeout(() => {
            setNotifications(prevNotifications =>
              prevNotifications.filter(notification => notification.id !== newNotification.id)
            );
          }, 1200); 
        });
      }
    }, 300);  
  };

  const stopScanner = (mode) => {
    Barkoder?.stopScanner();
    setIsFlashOn(false);
    setZoomValue(1);
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

  const handleBarcodeTypeChange = (event) => {
    const value = event.target.value;
    setSelections((prevSelections) => ({
      ...prevSelections,
      barcode_type: value,
    }));
  };

  const handleSymChange = (event) => {
    const value = event.target.value;

    setSelections((prevSelections) => {
      const newSyms = prevSelections.syms.includes(value)
        ? prevSelections.syms.filter((sym) => sym !== value)
        : [...prevSelections.syms, value];

      symChange(newSyms);

      return { ...prevSelections, syms: newSyms, check_all: false };
    });
  };

  const symChange = (symsArr) => {
    const symsArrNumbers = symsArr.map((item) => Number(item));
    Barkoder?.setEnabledDecoders.apply(null, symsArrNumbers);
  };

  const handleCheckAll = () => {
    setSelections((prevSelections) => {
      const allSymbols = Object.keys(barcodesData);
      const isAllSelected = allSymbols.every((key) =>
        prevSelections.syms.includes(key)
      );
      const newSyms = isAllSelected ? [] : allSymbols;

      symChange(newSyms);

      return {
        ...prevSelections,
        syms: newSyms,
        check_all: !isAllSelected,
      };
    });
  };

  const barcodeTypes = Object.keys(barcodesData)
    .map((key) => barcodesData[key])
    .filter((barcode) => barcode.type === selections.barcode_type);

  const handleToggleAll = (event) => {
    const isChecked = event.target.checked;
    setSelections((prevSelections) => ({
      ...prevSelections,
      check_all: isChecked,
      syms: isChecked ? barcodeTypes.map((sym) => parseInt(sym.num)) : [],
    }));
  };
  
  
  //use effects
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      swipeHideResultSection();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await readTemplate();
      setTemplateData("all");
    };
    fetchData();
  }, []);

  useEffect(() => {
    setTemplateData(selections.template);
  }, [selections.template]);

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
    if (!selections.barcode_type) {
      setSelections((prev) => ({ ...prev, barcode_type: "1d" }));
    }
  }, [selections.barcode_type]);

  useEffect(() => {
    if (Barkoder?.applyTemplate) {
      const applyTemplate = async () => {
        await Barkoder.applyTemplate("templates.json", selections.template);
      };

      applyTemplate();
    }
  }, [selections.template]);

  useEffect(() => {
    if (Barkoder) {
      Barkoder.setDecodingSpeed(Number(selections.speed));
    }
  }, [selections.speed]);

  useEffect(() => {
    if (Barkoder) {
      Barkoder.setCameraResolution(Number(selections.camera_res));
    }
  }, [selections.camera_res]);

  useEffect(() => {
    if (Barkoder) {
      Barkoder.setDpsLimit(Number(selections.dps));
    }
  }, [selections.dps]);

  useEffect(() => {
    if (selections.syms) {
      setSelections((prevSelections) => ({
        ...prevSelections,
        check_all: Object.keys(barcodesData).length === selections.syms.length,
      }));
    }
  }, [selections.syms, barcodesData]);

  useEffect(() => {
    if (selections.camera_res) {
      Barkoder.setCameraResolution(Number(selections.camera_res));
    }
  }, [selections.camera_res]);

  useEffect(() => {
    if (selections.dps && Barkoder) {
      Barkoder.setDpsLimit(Number(selections.dps));
    }
  }, [selections.dps]);

  useEffect(() => {
    if (selections.template === "all") {
      handleCheckAll();
    }
  }, [selections.template, barcodesData]);

  useEffect(() => {
    if (Barkoder) {
      const handleVisibilityChange = () => {
        stopScanner();
      };   
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    }
  }, [Barkoder]);

  useEffect(() => {
    if (
      !flags.showResultBox &&
      isCameraStarted &&
      !selections.isMultiscanEnabled
    ) {
      stopScanner("restart");
    }
  }, [flags.showResultBox]);

  useEffect(() => {
    const fetchActiveCamera = async () => {
      if (Barkoder) {
        const activeCamera = await Barkoder?.getActiveCamera();
        if (activeCamera && activeCamera.id) {
          setSelections((prevSelections) => ({
            ...prevSelections,
            active_camera: activeCamera.id,
          }));
        }
      }
    };
  
    const delayFetchActiveCamera = () => {
      setTimeout(fetchActiveCamera, 3000);
    };
  
    delayFetchActiveCamera();
  }, [flags.cammeraRunning]);

  useEffect(() => {
    const { barcodeTitle, barcodeDescription } = getBarcodeData();

    if (barcodeTitle && barcodeDescription) {
      const isDuplicate = scannedBarcodes.some(
        (barcode) =>
          barcode.barcodeTitle === barcodeTitle && barcode.barcodeDescription === barcodeDescription
      );

      if (!isDuplicate) {
        setScannedBarcodes((prevScannedBarcodes) => [
          ...prevScannedBarcodes,
          { barcodeTitle, barcodeDescription },
        ]);
      }
    }
  }, [document.getElementById("barcode_title")?.textContent, document.getElementById("barcode_description")?.textContent]);

  // useMemo
  const templateTitle = useMemo(() => {
    return templateTitles[selections.template];
  }, [selections.template, templateTitles]);

  const decoderSpeedList = useMemo(() => {
    if (Barkoder) {
      const speedModes = [
        Object.keys(Barkoder.constants.DecodingSpeed)[0],
        Object.keys(Barkoder.constants.DecodingSpeed)[1],
        Object.keys(Barkoder.constants.DecodingSpeed)[2],
      ];

      return speedModes.map((speedMode) => ({
        value: Barkoder.constants.DecodingSpeed[speedMode],
        text: speedMode,
      }));
    }
  }, [Barkoder]);

  const cameraResolutionList = useMemo(() => {
    if (Barkoder) {
      const resolutionModes = [
        Object.keys(Barkoder.constants.CameraResolution)[0],
        Object.keys(Barkoder.constants.CameraResolution)[1],
      ];
      return resolutionModes.map((resolutionMode) => ({
        value: Barkoder.constants.CameraResolution[resolutionMode],
        text: resolutionMode,
      }));
    }
  }, [Barkoder]);

  Barkoder?.addEventListener("startScanner", function(e) {
    setFlags(prevFlags => ({
      ...prevFlags,
      cammeraLoading: false,
      cammeraRunning: true
    }));

    const checkFlash = Barkoder.isFlashAvailable()
    const checkZoom = Barkoder.getMaxZoomFactor()
    setIsFlashAvailable(checkFlash)
    setIsZoomAvailable(checkZoom)  
  });

  return (
    <>
      <div id="wasmApp">
        {flags.mode === "noActiveCamera" && (
          <div className="noActiveCamera">
            <div className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409"
                />
              </svg>
            </div>
            <p>Camera access is required to run this Web Demo.</p>
            <a href="/">Reload Page</a>
          </div>
        )}

        {flags.mode !== "noActiveCamera" && <div id="barkoder-container"></div>}

        {!flags.noActiveCamera && (
          <div id="controls">
            {flags.mode === "scanning" && (
              <button
                className="stop_scanner"
                type="button"
                onClick={stopScanner}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  fill="#FF3347"
                >
                  <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                </svg>
              </button>
            )}
            {notifications.length > 0 && (
              <div className="notifications">
                {notifications.map((message, index) => (
                  <p
                    key={index}
                    className="notification"
                  >
                    {message.textualData}
                  </p>
                ))}
              </div>
            )}

            <div className={`box_parent ${flags.showBox ? "ontop" : ""}`}>
              {!selections.isMultiscanEnabled &&
                flags.showResultBox &&
                !flags.cammeraRunning && (
                  <div
                    className="start_scan_overlay"
                    onClick={() =>
                      setFlags((prevFlags) => ({
                        ...prevFlags,
                        showResultBox: false,
                      }))
                    }
                  >
                    <div className="start_scanner_result_img">
                      <p>Press anywhere to continue</p>
                    </div>
                  </div>
                )}
              {flags.mode !== 'initial' && showStartBtn && selections.isMultiscanEnabled === false && <button
                    id="startAgain"
                    onClick={startScanner}
                  >
                    Start Camera
                  </button> }

              {flags.mode === "scanning" &&
                flags.cammeraLoading &&
                !flags.showResultBox &&
                 (
                  <svg
                    id="cameraLoader"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 200 200"
                  >
                    <radialGradient
                      id="a"
                      cx=".66"
                      fx=".66"
                      cy=".3125"
                      fy=".3125"
                      gradientTransform="scale(1.5)"
                    >
                      <stop
                        className="svg__stop-color"
                        offset="0"
                        stopColor="#ff0000"
                      />
                      <stop
                        className="svg__stop-color"
                        offset="0.3"
                        stopColor="#ff5500"
                        stopOpacity="0.9"
                      />
                      <stop
                        className="svg__stop-color"
                        offset="0.6"
                        stopColor="#ff0000"
                        stopOpacity="0.6"
                      />
                      <stop
                        className="svg__stop-color"
                        offset="0.8"
                        stopColor="#ff5500"
                        stopOpacity="0.3"
                      />
                      <stop
                        className="svg__stop-color"
                        offset="1"
                        stopColor="#ff0000"
                        stopOpacity="0"
                      />
                    </radialGradient>

                    <circle
                      className="svg_strokeWidth"
                      transformorigin="center"
                      fill="none"
                      stroke="url(#a)"
                      strokeWidth="18"
                      strokeLinecap="round"
                      strokeDasharray="440"
                      strokeDashoffset="440"
                      cx="100"
                      cy="100"
                      r="70"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        from="440"
                        to="0"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    <circle
                      className="svg__stroke svg_strokeWidth"
                      transformorigin="center"
                      fill="none"
                      opacity="0.2"
                      stroke="#ff0000"
                      strokeWidth="18"
                      strokeLinecap="round"
                      cx="100"
                      cy="100"
                      r="70"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        from="440"
                        to="0"
                        dur="2s"
                        keyTimes="0;1"
                        repeatCount="indefinite"
                        begin="1s"
                      />
                    </circle>
                  </svg>
                )}

              {flags.mode === "initial" && (
                <div className="initial_screen">
                  <div className="logo">
                    <img
                      alt="barkoder logo"
                      src="./images/logo-barkoder.svg"
                    />
                  </div>
                  <div className="description">
                    <h2>Barcode Scanner SDK for the Web</h2>
                    <p>
                      The industry-leading barKoder Barcode Scanner SDK for
                      mobile is now also available for any web applications,
                      enabling barcode reading via most internet browsers.
                    </p>
                    <p>
                      Find out more information{" "}
                      <a
                        target="_blank"
                        href="site_url('barcode-scanner-sdk/platforms/wasm')"
                      >
                        here
                      </a>
                      .
                    </p>
                  </div>

                  <div className="types_container_scroll">
                    <div className="types_container">
                      <div className="types_container">
                        {templateValues.map((value) => (
                          <BarcodeOptions
                            key={value}
                            value={value}
                            templateTitles={templateTitles}
                            selections={selections}
                            setSelections={setSelections}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="action">
                    {!isInitialized ? (
                      <button
                        style={{
                          padding: "12px",
                          color: "red",
                          border: "1px solid red",
                        }}
                        type="button"
                        disabled
                      >
                        Initializing Barkoder, please wait ...
                      </button>
                    ) : (
                      <button
                        className="start_scanner"
                        type="button"
                        onClick={startScanner}
                      >
                        Start Scanner
                      </button>
                    )}
                  </div>
                </div>
              )}

              {flags.mode === "scanning" && (
                <div className="mainActions fade-in">
                  <button
                    onClick={() => showBox("barcodeTypes")}
                    className={flags.showBox === "barcodeTypes" ? "active" : ""}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17 21.25H7C3.35 21.25 1.25 19.15 1.25 15.5V8.5C1.25 4.85 3.35 2.75 7 2.75H17C20.65 2.75 22.75 4.85 22.75 8.5V15.5C22.75 19.15 20.65 21.25 17 21.25ZM7 4.25C4.14 4.25 2.75 5.64 2.75 8.5V15.5C2.75 18.36 4.14 19.75 7 19.75H17C19.86 19.75 21.25 18.36 21.25 15.5V8.5C21.25 5.64 19.86 4.25 17 4.25H7Z" />
                      <path d="M6 16.75C5.59 16.75 5.25 16.41 5.25 16V8C5.25 7.59 5.59 7.25 6 7.25C6.41 7.25 6.75 7.59 6.75 8V16C6.75 16.41 6.41 16.75 6 16.75Z" />
                      <path d="M9 12.75C8.59 12.75 8.25 12.41 8.25 12V8C8.25 7.59 8.59 7.25 9 7.25C9.41 7.25 9.75 7.59 9.75 8V12C9.75 12.41 9.41 12.75 9 12.75Z" />
                      <path d="M9 16.75C8.59 16.75 8.25 16.41 8.25 16V15C8.25 14.59 8.59 14.25 9 14.25C9.41 14.25 9.75 14.59 9.75 15V16C9.75 16.41 9.41 16.75 9 16.75Z" />
                      <path d="M15 9.75C14.59 9.75 14.25 9.41 14.25 9V8C14.25 7.59 14.59 7.25 15 7.25C15.41 7.25 15.75 7.59 15.75 8V9C15.75 9.41 15.41 9.75 15 9.75Z" />
                      <path d="M12 16.75C11.59 16.75 11.25 16.41 11.25 16V8C11.25 7.59 11.59 7.25 12 7.25C12.41 7.25 12.75 7.59 12.75 8V16C12.75 16.41 12.41 16.75 12 16.75Z" />
                      <path d="M15 16.75C14.59 16.75 14.25 16.41 14.25 16V12C14.25 11.59 14.59 11.25 15 11.25C15.41 11.25 15.75 11.59 15.75 12V16C15.75 16.41 15.41 16.75 15 16.75Z" />
                      <path d="M18 16.75C17.59 16.75 17.25 16.41 17.25 16V8C17.25 7.59 17.59 7.25 18 7.25C18.41 7.25 18.75 7.59 18.75 8V16C18.75 16.41 18.41 16.75 18 16.75Z" />
                    </svg>
                    <svg
                      className="arrow"
                      width="8"
                      height="5"
                      viewBox="0 0 8 5"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M7.30099 7.10487e-05C7.12332 7.10487e-05 6.94565 0.0655298 6.80538 0.205799L4 3.01118L1.19462 0.205799C0.923437 -0.0653877 0.474576 -0.0653877 0.20339 0.205799C-0.0677966 0.476985 -0.0677966 0.925845 0.20339 1.19703L3.50438 4.49803C3.77557 4.76921 4.22443 4.76921 4.49562 4.49803L7.79661 1.19703C8.0678 0.925845 8.0678 0.476985 7.79661 0.205799C7.65634 0.0655298 7.47867 7.10487e-05 7.30099 7.10487e-05Z" />
                    </svg>
                  </button>

                  {cameras.length > 0 && (
                    <button
                      onClick={() => showBox("cameraPicker")}
                      className={
                        flags.showBox === "cameraPicker" ? "active" : ""
                      }
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z" />
                        <path d="M12 16.25C9.66 16.25 7.75 14.34 7.75 12C7.75 9.66 9.66 7.75 12 7.75C14.34 7.75 16.25 9.66 16.25 12C16.25 14.34 14.34 16.25 12 16.25ZM12 9.25C10.48 9.25 9.25 10.48 9.25 12C9.25 13.52 10.48 14.75 12 14.75C13.52 14.75 14.75 13.52 14.75 12C14.75 10.48 13.52 9.25 12 9.25Z" />
                        <path d="M17 7.4999C16.87 7.4999 16.74 7.4699 16.62 7.4199C16.5 7.3699 16.39 7.2999 16.29 7.2099C16.2 7.1099 16.12 6.9999 16.07 6.8799C16.02 6.7599 16 6.6299 16 6.4999C16 6.3699 16.02 6.2399 16.07 6.1199C16.13 5.9899 16.2 5.8899 16.29 5.7899C16.34 5.7499 16.39 5.6999 16.44 5.6699C16.5 5.6299 16.56 5.5999 16.62 5.5799C16.68 5.5499 16.74 5.5299 16.81 5.5199C17.13 5.4499 17.47 5.5599 17.71 5.7899C17.8 5.8899 17.87 5.9899 17.92 6.1199C17.97 6.2399 18 6.3699 18 6.4999C18 6.6299 17.97 6.7599 17.92 6.8799C17.87 6.9999 17.8 7.1099 17.71 7.2099C17.61 7.2999 17.5 7.3699 17.38 7.4199C17.26 7.4699 17.13 7.4999 17 7.4999Z" />
                      </svg>
                      <svg
                        className="arrow"
                        width="8"
                        height="5"
                        viewBox="0 0 8 5"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M7.30099 7.10487e-05C7.12332 7.10487e-05 6.94565 0.0655298 6.80538 0.205799L4 3.01118L1.19462 0.205799C0.923437 -0.0653877 0.474576 -0.0653877 0.20339 0.205799C-0.0677966 0.476985 -0.0677966 0.925845 0.20339 1.19703L3.50438 4.49803C3.77557 4.76921 4.22443 4.76921 4.49562 4.49803L7.79661 1.19703C8.0678 0.925845 8.0678 0.476985 7.79661 0.205799C7.65634 0.0655298 7.47867 7.10487e-05 7.30099 7.10487e-05Z" />
                      </svg>
                    </button>
                  )}

                  <button
                    onClick={() => showBox("setting")}
                    className={flags.showBox === "setting" ? "active" : ""}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z" />
                      <path d="M15.58 19.2501C15.17 19.2501 14.83 18.9101 14.83 18.5001V14.6001C14.83 14.1901 15.17 13.8501 15.58 13.8501C15.99 13.8501 16.33 14.1901 16.33 14.6001V18.5001C16.33 18.9101 15.99 19.2501 15.58 19.2501Z" />
                      <path d="M15.58 8.2C15.17 8.2 14.83 7.86 14.83 7.45V5.5C14.83 5.09 15.17 4.75 15.58 4.75C15.99 4.75 16.33 5.09 16.33 5.5V7.45C16.33 7.86 15.99 8.2 15.58 8.2Z" />
                      <path d="M15.58 13.4C13.73 13.4 12.23 11.9 12.23 10.05C12.23 8.19995 13.73 6.69995 15.58 6.69995C17.43 6.69995 18.93 8.19995 18.93 10.05C18.93 11.9 17.42 13.4 15.58 13.4ZM15.58 8.19995C14.56 8.19995 13.73 9.02995 13.73 10.05C13.73 11.07 14.56 11.9 15.58 11.9C16.6 11.9 17.43 11.07 17.43 10.05C17.43 9.02995 16.59 8.19995 15.58 8.19995Z" />
                      <path d="M8.41998 19.25C8.00998 19.25 7.66998 18.91 7.66998 18.5V16.55C7.66998 16.14 8.00998 15.8 8.41998 15.8C8.82998 15.8 9.16998 16.14 9.16998 16.55V18.5C9.16998 18.91 8.83998 19.25 8.41998 19.25Z" />
                      <path d="M8.41998 10.15C8.00998 10.15 7.66998 9.81 7.66998 9.4V5.5C7.66998 5.09 8.00998 4.75 8.41998 4.75C8.82998 4.75 9.16998 5.09 9.16998 5.5V9.4C9.16998 9.81 8.83998 10.15 8.41998 10.15Z" />
                      <path d="M8.42001 17.3001C6.57001 17.3001 5.07001 15.8001 5.07001 13.9501C5.07001 12.1001 6.57001 10.6001 8.42001 10.6001C10.27 10.6001 11.77 12.1001 11.77 13.9501C11.77 15.8001 10.27 17.3001 8.42001 17.3001ZM8.42001 12.1001C7.40001 12.1001 6.57001 12.9301 6.57001 13.9501C6.57001 14.9701 7.40001 15.8001 8.42001 15.8001C9.44001 15.8001 10.27 14.9701 10.27 13.9501C10.27 12.9301 9.45001 12.1001 8.42001 12.1001Z" />
                    </svg>
                    <svg
                      className="arrow"
                      width="8"
                      height="5"
                      viewBox="0 0 8 5"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M7.30099 7.10487e-05C7.12332 7.10487e-05 6.94565 0.0655298 6.80538 0.205799L4 3.01118L1.19462 0.205799C0.923437 -0.0653877 0.474576 -0.0653877 0.20339 0.205799C-0.0677966 0.476985 -0.0677966 0.925845 0.20339 1.19703L3.50438 4.49803C3.77557 4.76921 4.22443 4.76921 4.49562 4.49803L7.79661 1.19703C8.0678 0.925845 8.0678 0.476985 7.79661 0.205799C7.65634 0.0655298 7.47867 7.10487e-05 7.30099 7.10487e-05Z" />
                    </svg>
                  </button>

                  <button className="zoom_btn" style={{ color: 'white' }} onClick={handleZoom} disabled={isZoomAvailable === 1}>
                    {zoomValue === 3 ? <CiZoomOut size={24} /> : <CiZoomIn size={24} />} 
                  </button>
                  <button 
                    className="flash_btn" 
                    style={{ color: 'white' }} 
                    onClick={handleFlash} 
                    disabled={isFlashAvailable === false}
                  >
                    {isFlashOn ? (
                      <IoIosFlash size={20} />
                    ) : (
                      <IoIosFlashOff size={20} />
                    )}
                  </button>
                </div>
              )}

              {flags.showBox === "barcodeTypes" && (
                <div className="box_options fade-in">
                  <div className="box_heading">
                    <h2>{templateTitle}</h2>
                    <button
                      className="close"
                      type="button"
                      onClick={() => showBox("")}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.16999 15.5799C8.97999 15.5799 8.78999 15.5099 8.63999 15.3599C8.34999 15.0699 8.34999 14.5899 8.63999 14.2999L14.3 8.63986C14.59 8.34986 15.07 8.34986 15.36 8.63986C15.65 8.92986 15.65 9.40986 15.36 9.69986L9.69998 15.3599C9.55998 15.5099 9.35999 15.5799 9.16999 15.5799Z" />
                        <path d="M14.83 15.5799C14.64 15.5799 14.45 15.5099 14.3 15.3599L8.63999 9.69986C8.34999 9.40986 8.34999 8.92986 8.63999 8.63986C8.92999 8.34986 9.40998 8.34986 9.69998 8.63986L15.36 14.2999C15.65 14.5899 15.65 15.0699 15.36 15.3599C15.21 15.5099 15.02 15.5799 14.83 15.5799Z" />
                        <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z" />
                      </svg>
                    </button>
                  </div>
                  <div>
                    {/* Barcode Type Selection (1D/2D) */}
                    <div className="symPickerType">
                      <div className="types_filter_name">
                        <input
                          id="1d_syms"
                          type="checkbox"
                          value="1d"
                          checked={selections.barcode_type === "1d"}
                          onChange={handleBarcodeTypeChange}
                        />
                        <label htmlFor="1d_syms">1D Barcodes</label>
                      </div>
                      <div className="types_filter_name">
                        <input
                          id="2d_syms"
                          type="checkbox"
                          value="2d"
                          checked={selections.barcode_type === "2d"}
                          onChange={handleBarcodeTypeChange}
                        />
                        <label htmlFor="2d_syms">2D Barcodes</label>
                      </div>
                    </div>

                    {/* Barcode Symbols (based on selected type) */}
                    <div className="symPicker">
                      {Object.entries(barcodesData)
                        .filter(
                          ([key, barcode]) =>
                            barcode.type === selections.barcode_type
                        )
                        .map(([key, barcode]) => (
                          <div
                            className="switch_toggle"
                            key={key}
                          >
                            <input
                              id={`${barcode.title}`}
                              type="checkbox"
                              value={key}
                              checked={selections.syms.includes(key.toString())}
                              onChange={handleSymChange}
                            />
                            <label htmlFor={`${barcode.title}`}>
                              <span className="slider"></span>
                              <span className="label_text">
                                {barcode.title}
                              </span>
                            </label>
                          </div>
                        ))}
                    </div>

                    {/* Toggle All */}
                    <div className="symPickerAll">
                      <div className="btn_toggle v2">
                        <input
                          id="all_syms"
                          type="checkbox"
                          checked={selections.check_all}
                          onChange={handleCheckAll}
                        />
                        <label htmlFor="all_syms">Toggle All</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

    

              {(flags.mode === "scanning" || selections.isMultiscanEnabled) &&
                flags.showBox === "cameraPicker" && (
                  <div className="box_options fade-in">
                  <div className="box_heading">
                    <h2>Choose Camera</h2>
                    <button className="close" type="button" onClick={() => setFlags((prevFlags) => ({...prevFlags, showBox: "" }))}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.16999 15.5799C8.97999 15.5799 8.78999 15.5099 8.63999 15.3599C8.34999 15.0699 8.34999 14.5899 8.63999 14.2999L14.3 8.63986C14.59 8.34986 15.07 8.34986 15.36 8.63986C15.65 8.92986 15.65 9.40986 15.36 9.69986L9.69998 15.3599C9.55998 15.5099 9.35999 15.5799 9.16999 15.5799Z" />
                        <path d="M14.83 15.5799C14.64 15.5799 14.45 15.5099 14.3 15.3599L8.63999 9.69986C8.34999 9.40986 8.34999 8.92986 8.63999 8.63986C8.92999 8.34986 9.40998 8.34986 9.69998 8.63986L15.36 14.2999C15.65 14.5899 15.65 15.0699 15.36 15.3599C15.21 15.5099 15.02 15.5799 14.83 15.5799Z" />
                        <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z" />
                      </svg>
                    </button>
                  </div>
                  <div className="cameraPicker">
                    {cameras.map((camera) => (
                      <button
                        key={camera.id}
                        onClick={() => handleCameraChange(camera.id)}
                        className={camera.id === selections.active_camera ? 'active' : ''}
                      >
                        {camera.label}
                        <svg className="check" width="16" height="12" viewBox="0 0 16 12" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5.50001 9.47511L2.02501 6.00011L0.841675 7.17511L5.50001 11.8334L15.5 1.83345L14.325 0.658447L5.50001 9.47511Z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                 )} 

              {/* Settings Box */}
              {(flags.mode === "scanning" || selections.isMultiscanEnabled) &&
                flags.showBox === "setting" && (
                  <div className="box_options fade-in">
                    <div className="box_heading">
                      <h2>Options</h2>
                      <button
                        className="close"
                        type="button"
                        onClick={() => showBox("")}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.16999 15.5799C8.97999 15.5799 8.78999 15.5099 8.63999 15.3599C8.34999 15.0699 8.34999 14.5899 8.63999 14.2999L14.3 8.63986C14.59 8.34986 15.07 8.34986 15.36 8.63986C15.65 8.92986 15.65 9.40986 15.36 9.69986L9.69998 15.3599C9.55998 15.5099 9.35999 15.5799 9.16999 15.5799Z" />
                          <path d="M14.83 15.5799C14.64 15.5799 14.45 15.5099 14.3 15.3599L8.63999 9.69986C8.34999 9.40986 8.34999 8.92986 8.63999 8.63986C8.92999 8.34986 9.40998 8.34986 9.69998 8.63986L15.36 14.2999C15.65 14.5899 15.65 15.0699 15.36 15.3599C15.21 15.5099 15.02 15.5799 14.83 15.5799Z" />
                          <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z" />
                        </svg>
                      </button>
                    </div>
                    <div className="dropdowns">
                      <div className="line">
                        <label>Select Template</label>
                        <select
                          value={selections.template}
                          onChange={(e) =>
                            setSelections((prevSelections) => ({
                              ...prevSelections,
                              template: e.target.value,
                            }))
                          }
                        >
                          <option value="custom">Custom</option>
                          <option value="all">All Barcodes</option>
                          <option value="pdf_optimized">
                            PDF417 Optimized Barcodes
                          </option>
                          <option value="qr">QR Barcodes</option>
                          <option value="retail_1d">Retail 1D Barcodes</option>
                          <option value="industrial_1d">
                            Industrial 1D Barcodes
                          </option>
                          <option value="all_2d">All 2D Barcodes</option>
                          <option value="dpm">DPM Barcodes</option>
                          <option value="vin">VIN Barcodes</option>
                          <option value="dotcode">Dotcodes</option>
                        </select>
                      </div>

                      <div className="line">
                        <label>Select Camera Resolution</label>
                        <select
                          value={selections.camera_res}
                          onChange={(e) =>
                            setSelections((prevSelections) => ({
                              ...prevSelections,
                              camera_res: e.target.value,
                            }))
                          }
                        >
                          {cameraResolutionList.map((camRes) => (
                            <option
                              key={camRes.value}
                              value={camRes.value}
                            >
                              {camRes.text}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="line">
                        <label>Select Decoding Speed</label>
                        <select
                          value={selections.speed}
                          onChange={(e) =>
                            setSelections((prevSelections) => ({
                              ...prevSelections,
                              speed: e.target.value,
                            }))
                          }
                        >
                          {decoderSpeedList.map((decoder) => (
                            <option
                              key={decoder.value}
                              value={decoder.value}
                            >
                              {decoder.text}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="line">
                        <label>Select DPS Limit</label>
                        <select
                          value={selections.dps}
                          onChange={(e) =>
                            setSelections((prevSelections) => ({
                              ...prevSelections,
                              dps: e.target.value,
                            }))
                          }
                        >
                          {[...Array(10).keys()].map((index) => (
                            <option
                              key={index + 1}
                              value={index + 1}
                            >
                              {index + 1}
                            </option>
                          ))}
                          <option value="28">28</option>
                        </select>
                      </div>

                      <div className="line">
                        <div className="switch_toggle">
                          <input
                            id="multicodeEnable"
                            type="checkbox"
                            name="syms"
                            checked={selections.isMultiscanEnabled}
                            onChange={changeMultiscanOption}
                          />
                          <label htmlFor="multicodeEnable">
                            <span className="slider"></span>
                            <span className="label_text">
                              {selections.isMultiscanEnabled
                                ? "MultiScan Enabled"
                                : "MultiScan Disabled"}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            <BarcodeResultBox
              isExpanded={isExpanded}
              // totalScannedBarcodes={totalScannedBarcodes}
              // result={result}
              barcodesScannedCount={barcodesScannedCount}
              flags={flags}
              setFlags={setFlags}
              selections={selections}
              copyResult={copyResult}
              exportToCSV={exportToCSV}
              startScanner={startScanner}
              toggleExpand={toggleExpand}
              searchResult={searchResult}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default SampleApp;
