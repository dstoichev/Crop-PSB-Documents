#target photoshop

#include "./include/json2.js"

(function() {
    //
    // psx.jsx
    //   This file contains a collection code extracted from other parts
    //   of xtools for use in production scripts written for Adobe.
    //
    // $Id: psx.jsx,v 1.63 2012/03/15 21:34:28 anonymous Exp $
    // Copyright: (c)2011, xbytor
    // Author: xbytor@gmail.com
    // License: http://www.opensource.org/licenses/bsd-license.php
    //
    
    //    
    // !!! Only an EXTRACT from psx.jsx !!!
    // http://ps-scripts.sourceforge.net/xtools.html
    //
    
    cTID = function(s) { return cTID[s] || (cTID[s] = app.charIDToTypeID(s)); };
    sTID = function(s) { return sTID[s] || (sTID[s] = app.stringIDToTypeID(s)); };
    
    // return an ID for whatever s might be
    xTID = function(s) {
      if (s.constructor == Number) {
        return s;
      }
      try {
        if (s instanceof XML) {
          var k = s.nodeKind();
          if (k == 'text' || k == 'attribute') {
            s = s.toString();
          }
        }
      } catch (e) {
      }
    
      if (s.constructor == String) {
        if (s.length > 0) {
          if (s.length != 4) return sTID(s);
          try { return cTID(s); } catch (e) { return sTID(s); }
        }
      }
      Error.runtimeError(19, s);  // Bad Argument
    
      return undefined;
    };
    
    //
    // Convert a 32 bit ID back to either a 4 character representation or the
    // mapped string representation.
    //
    id2char = function(s) {
      if (isNaN(Number(s))){
        return '';
      }
      var v;
    
      var lvl = $.level;
      $.level = 0;
      try {
        if (!v) {
          try { v = app.typeIDToCharID(s); } catch (e) {}
        }
        if (!v) {
          try { v = app.typeIDToStringID(s); } catch (e) {}
        }
      } catch (e) {
      }
      $.level = lvl;
    
      if (!v) {
        // neither of the builtin PS functions know about this ID so we
        // force the matter
        v = psx.numberToAscii(s);
      }
    
      return v ? v : s;
    };
    
    
    //
    // What platform are we on?
    //
    isWindows = function() { return $.os.match(/windows/i); };
    isMac = function() { return !isWindows(); };
    
    //
    // Which app are we running in?
    //
    isPhotoshop = function() { return !!app.name.match(/photoshop/i); };
    isBridge = function() { return !!app.name.match(/bridge/i); };
    
    //
    // Which CS version is this?
    //
    CSVersion = function() {
      var rev = Number(app.version.match(/^\d+/)[0]);
      return isPhotoshop() ? (rev - 7) : rev;
    };
    CSVersion._version = CSVersion();
    
    // not happy about the CS7+ definitions
    isCC2015 = function()  { return CSVersion._version == 9; };
    isCC2014 = function()  { return CSVersion._version == 8; }; 
    isCC     = function()  { return CSVersion._version == 7; }; 
    isCS7    = function()  { return CSVersion._version == 7; };
    isCS6    = function()  { return CSVersion._version == 6; };
    isCS5    = function()  { return CSVersion._version == 5; };
    isCS4    = function()  { return CSVersion._version == 4; };
    isCS3    = function()  { return CSVersion._version == 3; };
    isCS2    = function()  { return CSVersion._version == 2; };
    isCS     = function()  { return CSVersion._version == 1; };


    //
    // psx works as a namespace for commonly used functions
    //
    psx = function() {};

    //
    // Function: getLayerDescriptor
    // Description: Gets the ActionDescriptor for a layer
    // Input:  doc   - a Document
    //         layer - a Layer
    // Return: an ActionDescriptor
    //
    psx.getLayerDescriptor = function(doc, layer) {
      var ref = new ActionReference();
      ref.putEnumerated(cTID("Lyr "), cTID("Ordn"), cTID("Trgt"));
      return executeActionGet(ref);
    };
    
    //
    // Function: hasLayerMask
    //           isLayerMaskEnabled
    //           disableLayerMask
    //           enableLayerMask
    //           setLayerMaskEnabledState
    // Description: A collection of functions dealing with the state
    //              of a layer's mask.
    //              
    // Input:  doc   - a Document
    //         layer - a Layer
    // Return: boolean or <none>
    //
    psx.hasLayerMask = function(doc, layer) {
        var d = psx.getLayerDescriptor(doc, layer);
        /*
        var keys = ''.concat('Layer ', d.getString(cTID('Nm  ')), "\n");
        
        for (var i = 0; i < d.count; i++)
        {
            keys = keys.concat(id2char(d.getKey(i) ), "\n");
        }
        alert(keys);
        */
      return d.hasKey(cTID("UsrM"));
    };
    psx.isLayerMaskEnabled = function(doc, layer) {
      var desc = psx.getLayerDescriptor(doc, layer);
      return (desc.hasKey(cTID("UsrM")) && desc.getBoolean(cTID("UsrM")));
    };
    psx.disableLayerMask = function(doc, layer) {
      psx.setLayerMaskEnabledState(doc, layer, false);
    };
    psx.enableLayerMask = function(doc, layer) {
      psx.setLayerMaskEnabledState(doc, layer, true);
    };
    psx.setLayerMaskEnabledState = function(doc, layer, state) {
      if (state == undefined) {
        state = false;
      }
      var desc = new ActionDescriptor();
    
      var ref = new ActionReference();
      ref.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
      desc.putReference(cTID('null'), ref );
    
      var tdesc = new ActionDescriptor();
      tdesc.putBoolean(cTID('UsrM'), state);
      desc.putObject(cTID('T   '), cTID('Lyr '), tdesc);
    
      executeAction(cTID('setd'), desc, DialogModes.NO );
    };
    
    //
    // Function: getSelectionBounds
    // Description: Get the bounds of the current selection
    // Input:  doc  - a Document
    // Return: a bound rectangle (in pixels)
    //
    psx.getSelectionBounds = function(doc) {
      var bnds = [];
      var sbnds = doc.selection.bounds;
      for (var i = 0; i < sbnds.length; i++) {
        bnds[i] = sbnds[i].as("px");
      }
      return bnds;
    };
    
    //
    // Function: hasSelection
    // Input:  doc  - a Document
    // Return: returns true if the document has as selection, false if not
    //
    psx.hasSelection = function(doc) {
      var res = false;
    
      var as = doc.activeHistoryState;
      doc.selection.deselect();
      if (as != doc.activeHistoryState) {
        res = true;
        doc.activeHistoryState = as;
      }
    
      return res;
    };
    
    
    //
    // Function: convertFptr
    // Description: convert something into a File/Folder object
    // Input: fptr - a String, XML object, or existing File/Folder object
    // Return: a File/Folder object
    //
    psx.convertFptr = function(fptr) {
      var f;
      try { if (fptr instanceof XML) fptr = fptr.toString(); } catch (e) {}
    
      if (fptr.constructor == String) {
        f = File(fptr);
    
      } else if (fptr instanceof File || fptr instanceof Folder) {
        f = fptr;
    
      } else {
        Error.runtimeError(19, "fptr");
      }
      return f;
    };

    //
    // Function: selectFolder
    // Description: Open a dialog to select a folder
    // Input:  prompt - (opt: "Select a Folder")
    //         start - the initial folder
    // Return: a Folder object or undefined if the user canceled
    //
    psx.selectFolder = function(prompt, start) {
      var folder;
    
      if (!prompt) {
        prompt = 'Select a folder';
      }
    
      if (start) {
        start = psx.convertFptr(start);
        while (start && !start.exists) {
          start = start.parent;
        }
      }
    
      if (!start) {
        folder = Folder.selectDialog(prompt);
    
      } else {
        if (start instanceof File) {
          start = start.parent;
        }
    
        folder = start.selectDlg(prompt);
      }
    
      return folder;
    };
    
    
    
    //
    // Format a Date object into a proper ISO 8601 date string
    //
    psx.toISODateString = function(date, timeDesignator, dateOnly, precision) {
      if (!date) date = new Date();
      var str = '';
      if (timeDesignator == undefined) { timeDesignator = 'T'; };
      function _zeroPad(val) { return (val < 10) ? '0' + val : val; }
      if (date instanceof Date) {
        str = (date.getFullYear() + '-' +
               _zeroPad(date.getMonth()+1,2) + '-' +
               _zeroPad(date.getDate(),2));
        if (!dateOnly) {
          str += (timeDesignator +
                  _zeroPad(date.getHours(),2) + ':' +
                  _zeroPad(date.getMinutes(),2) + ':' +
                  _zeroPad(date.getSeconds(),2));
          if (precision && typeof(precision) == "number") {
            var ms = date.getMilliseconds();
            if (ms) {
              var millis = _zeroPad(ms.toString(),precision);
              var s = millis.slice(0, Math.min(precision, millis.length));
              str += "." + s;
            }
          }
        }
      }
      return str;
    };
    
    //
    // Make it a Date object method
    //
    Date.prototype.toISODateString = function(timeDesignator, dateOnly, precision) {
      return psx.toISODateString(this, timeDesignator, dateOnly, precision);
    };
    
    Date.prototype.toISOString = Date.prototype.toISODateString;



    // EOF EXTRACT from psx.jsx;
    
    //
    // stdlib.js
    //   This file contains a collection of utility routines that I've
    //   written, borrowed, rewritten, and occasionally tested and
    //   documented.
    //
    //   Most of this stuff is photoshop specific. I'll break out the parts
    //   that aren't sometime in the future.
    //
    // $Id: stdlib.js,v 1.368 2015/11/18 00:51:32 anonymous Exp $
    // Copyright: (c)2015, xbytor
    // License: http://www.opensource.org/licenses/bsd-license.php
    // Contact: xbytor@gmail.com
    //
        
    //    
    // !!! Only an EXTRACT from stdlib.js !!!
    // http://ps-scripts.sourceforge.net/xtools.html
    //
    
    //
    //=============================== Stdlib =====================================
    // This is the name space for utility functions. This should probably be
    // broken up into smaller classes
    
    Stdlib = function() {};
        
    //
    // Return an item called 'name' from the specified container.
    // This works for the "magic" on PS containers like Documents.getByName(),
    // for instance. However this returns null if an index is not found instead
    // of throwing an exception.
    //
    // The 'name' argument can also be a regular expression.
    // If 'all' is set to true, it will return all matches
    //
    Stdlib.getByName = function(container, name, all) {
      // check for a bad index
      if (!name) {
        Error.runtimeError(2, "name"); // "'undefined' is an invalid name/index");
      }
    
      var matchFtn;
    
      if (name instanceof RegExp) {
        matchFtn = function(s1, re) { return s1.match(re) != null; };
      } else {
        matchFtn = function(s1, s2) { return s1 == s2;  };
      }
    
      var obj = [];
    
      for (var i = 0; i < container.length; i++) {
        if (matchFtn(container[i].name, name)) {
          if (!all) {
            return container[i];     // there can be only one!
          }
          obj.push(container[i]);    // add it to the list
        }
      }
    
      return all ? obj : undefined;
    };

    //
    // via SzopeN
    // These two vars are used by wrapLC/Layer and control whether or not
    // the existing doc/layer should be restored after the call is complete
    // If these are set fo false, the specified doc/layer will remain
    // the active doc/layer
    //
    Stdlib._restoreDoc = true;
    Stdlib._restoreLayer = true;
    
    //
    // ScriptingListener code operates on the "active" document.
    // There are times, however, when that is _not_ what I want.
    // This wrapper will make the specified document the active
    // document for the duration of the ScriptingListener code and
    // swaps in the previous active document as needed
    //
    Stdlib.wrapLC = function(doc, ftn) {
      var ad = app.activeDocument;
      if (doc) {
        if (ad != doc) {
          app.activeDocument = doc;
        }
      } else {
        doc = ad;
      }
    
      var res = undefined;
      try {
        res = ftn(doc);
    
      } finally {
        if (Stdlib._restoreDoc) {
          if (ad && app.activeDocument != ad) {
            app.activeDocument = ad;
          }
        }
      }
    
      return res;
    };

    //============================= History  ===============================
    //
    // Thanks to Andrew Hall for the idea
    // Added named snapshot support
    //
    Stdlib.takeSnapshot = function(doc, sname) {
      function _ftn() {
        var desc = new ActionDescriptor();  // Make
    
        var sref = new ActionReference();   // Snapshot
        sref.putClass(cTID("SnpS"));
        desc.putReference(cTID("null"), sref);
    
        var fref = new ActionReference();    // Current History State
        fref.putProperty(cTID("HstS"), cTID("CrnH"));
        desc.putReference(cTID("From"), fref );
    
        if (sname) {                         // Named snapshot
          desc.putString(cTID("Nm  "), sname);
        }
    
        desc.putEnumerated(cTID("Usng"), cTID("HstS"), cTID("FllD"));
        executeAction(cTID("Mk  "), desc, DialogModes.NO );
      }
    
      Stdlib.wrapLC(doc, _ftn);
    };
    
    //
    // Revert to named snapshot
    //
    Stdlib.revertToSnapshot = function(doc, sname) {
      function _ftn() {
        if (!sname) {
          return Stdlib.revertToLastSnapshot(doc);
        }
        var state = Stdlib.getByName(doc.historyStates, sname);
        if (state) {
          doc.activeHistoryState = state;
          return true;
        }
        return false;
      }
      return Stdlib.wrapLC(doc, _ftn);
    };
    
    //
    // Revert to the last auto-named snapshot
    //
    Stdlib.revertToLastSnapshot = function(doc) {
      function _ftn() {
        var states = Stdlib.getByName(doc.historyStates, /^Snapshot /, true);
        if (states.length > 0) {
          doc.activeHistoryState = states.pop();
          return true;
        }
        return false;
      }
      return Stdlib.wrapLC(doc, _ftn);
    };
    
    Stdlib.deleteSnapshot = function(doc, name) {
      function _ftn() {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putName(cTID('SnpS'), name);
        desc.putReference(cTID('null'), ref);
        executeAction(cTID('Dlt '), desc, DialogModes.NO );
      }
      return Stdlib.wrapLC(doc, _ftn);
    
    //   function _deleteCurrent() {
    //     var ref = new ActionReference();
    //     ref.putProperty(cTID("HstS"), cTID("CrnH"));
    
    //     var desc = new ActionDescriptor();
    //     desc.putReference(cTID("null"), ref );
    //     executeAction(cTID("Dlt "), desc, DialogModes.NO );
    //   };
    
    //   var state = doc.activeHistoryState;
    //   if (!Stdlib.revertToSnapshot(doc, name)) {
    //     return false;
    //   }
    //   try {
    //     _deleteCurrent(doc, name);
    //   } finally {
    //     var level = $.level;
    //     try {
    //       $.level = 0;
    //       doc.activeHistoryState = state;
    //     } catch (e) {
    //     }
    //     $.level = level;
    //   }
    //   return true;
    };

    // EOF EXTRACT from stdlib.js


    
    /**
     * @param{Object} opts - passed by reference
     */
    function CropSaverUi(opts) {
        this.bounds = "x: 200, y: 200, width: 650, height: 420";
        
        this.docNote1 = ''.concat('Process all documents currently OPEN in Photoshop.');
        
        this.docNote2 = ''.concat('Save an image cropped via the CROP layer ',
                                  'when this layer exists and an image AS IS when the layer is absent.');
        
        this.opts = opts;
        
        this.defaultSmallSizeOutputImageLongerSide = opts.smallSizeOutputImageLongerSide;
        
        this.title = 'Image Saving Preferences';
        
        this.windowRef = null;
    }

    CropSaverUi.prototype = {
        browseForOutputFolder: function() {
            var def = this.opts.outputResultsDestinationPath || Folder.current;
      
            var folder = psx.selectFolder("Select destination folder", def);
            if (folder) {
                this.windowRef.settingsPnl.outputFolderGroup.outputFolder.text = folder.fsName;
                this.opts.outputResultsDestinationPath = folder.fsName;
            }
        },
        
        escapePath: function(path) {
            return isWindows() ? path.replace(/\\/g, '\\\\') : path;
        },
        
        prepareWindow: function() {
            var that = this;
            // Define the resource specification string,
            // which specifies all of the components for the 
            // Image Saving Preferences dialog.
            var resource =
            "dialog { orientation:'column', alignChildren: 'fill', \
                text: '"+this.title+"', frameLocation:[100, 100],  \
                notePnl: Panel { \
                    text: 'Note', \
                    st1: StaticText { text: '', \
                                     characters: 60, alignment: 'left', \
                                     properties: {multiline: true} \
                    }, \
                    st2: StaticText { text: '', alignment: 'left', \
                                     characters: 60, \
                                     properties: {multiline: true} \
                    }, \
                }, \
                settingsPnl: Panel { orientation: 'column',\
                    outputFolderGroup: Group{orientation: 'row', alignChildren: 'fill', \
                        st: StaticText { alignment: ['left', 'center'], text: 'Output folder:' }, \
                        outputFolder: EditText {characters: 41, text: '"+this.escapePath( this.opts.outputResultsDestinationPath )+"'}, \
                        outputFolderBrowseBtn: Button { text:'...', size: [25, 20], properties:{name:'selectFolder'} } \
                    }, \
                    outputTypeGroup: Group{orientation: 'row', alignment: 'left',\
                        st: StaticText { alignment: ['left', 'center'], text: 'Output format:' }, \
                        rbJpeg: RadioButton { text: 'JPEG', value: 'true' }, \
                        rbTiff: RadioButton { text: 'TIFF' } \
                    }, \
                    smallSizeGroup: Group{orientation: 'column', alignment: 'left',\
                        chb: Checkbox { text: ' Create small size images, too.', alignment: ['left', 'center'] } \
                        selectSmallerSizeGroup: Group{orientation: 'row', alignment: 'left', margins: [20, 0, 10, 0] \
                            st: StaticText { alignment: ['left', 'center'], text: 'Set long side to:' }, \
                            sizeEt: EditText { characters: 5, text: '"+this.defaultSmallSizeOutputImageLongerSide+"' }, \
                            stPx: StaticText { alignment: ['left', 'center'], text: ' px' } \
                        }, \
                    }, \
                }, \
                btnGrp: Group { orientation:'row', alignment: 'right', \
                    processBtn: Button { text:'Process', properties:{name:'ok'} }, \
                    cancelBtn: Button { text:'Cancel', properties:{name:'cancel'} } \
                } \
            }";
            
            // Create a window of type dialog.
            this.windowRef = new Window(resource);
            this.windowRef.notePnl.st1.text = this.docNote1;
            this.windowRef.notePnl.st2.text = this.docNote2;
            
            var settings = this.windowRef.settingsPnl;
            
            // Register event listeners that define the button behavior
            settings.outputFolderGroup.outputFolderBrowseBtn.onClick = function() {
                that.browseForOutputFolder.call(that);
            };
            
            var typeGroup = settings.outputTypeGroup;
            typeGroup.rbJpeg.onClick = typeGroup.rbTiff.onClick = function() {
                var selected = 'JPEG';
                if (typeGroup.rbTiff.value) {
                    selected = 'TIFF';
                }
                that.opts.outputImageType = selected;
            };
            
            var smallSizeGroup = settings.smallSizeGroup;
            smallSizeGroup.chb.onClick = function() {
                if (smallSizeGroup.chb.value) {
                    that.opts.wantSmallSize = true;
                    smallSizeGroup.selectSmallerSizeGroup.enabled = true;
                }
                else {
                    that.opts.wantSmallSize = false;
                    smallSizeGroup.selectSmallerSizeGroup.enabled = false;
                }
            };
            
            var selectSmallerSizeGroup = smallSizeGroup.selectSmallerSizeGroup,
                sizeEditText = selectSmallerSizeGroup.sizeEt;                
                
            selectSmallerSizeGroup.enabled = false;
            
            sizeEditText.onChange = function() {
                var size = parseInt(sizeEditText.text);
                if (isNaN(size) || 0 >= size) {                    
                    size = that.defaultSmallSizeOutputImageLongerSide;
                    sizeEditText.text = size;
                    alert('A size must be a positive integer.');
                }
                that.opts.smallSizeOutputImageLongerSide = size;
            };
            
            var buttonGroup = this.windowRef.btnGrp;
            buttonGroup.processBtn.onClick = function() {
                that.windowRef.close(0);
            };
            buttonGroup.cancelBtn.onClick = function() {
                that.windowRef.close(2);
            };
            
            this.windowRef.center();
            
            return this.windowRef;
        }
    };

    
    function CropSaver() {
        this.alertText = ''.concat('Processed documents:', "\n\n");
                
        this.cropLayerName = 'CROP';
        
        this.opts = {
            outputResultsDestinationPath: Folder.myDocuments.fsName,
            outputImageType: 'JPEG',
            wantSmallSize: false,
            smallSizeOutputImageLongerSide: 1000
        };
        
        this.okTextlineFeed = "\n";
        
        this.outputFileExtension = '';
        this.saveOptions = null;
    }
    
    CropSaver.prototype = {
        /**
         * Copy Merged via ActionManager code
         */
        copyMerged: function() {    
            var idCpyM = charIDToTypeID( "CpyM" );
            executeAction( idCpyM, undefined, DialogModes.NO );
        },
        
        init: function() {
            var originalRulerUnits = app.preferences.rulerUnits;
            app.preferences.rulerUnits = Units.PIXELS;
                        
            try {
                var ui = new CropSaverUi(this.opts),
                    //alertText = ''.concat('Crop Saver Preferences:', "\n"),
                    win = ui.prepareWindow(),
                    result = win.show();
                /*
                alertText = alertText.concat('Gettind Preferences Result: ', result, "\n",
                                             'Preferences: ', "\n",
                                             this.opts.outputResultsDestinationPath, "\n",
                                             this.opts.outputImageType, "\n",
                                             this.opts.wantSmallSize, "\n");
                alert(alertText);
                */
                if (2 != result) {                    
                    this.main();
                }
                
            } catch (e) {
                alert(e);
            }
            
            app.preferences.rulerUnits = originalRulerUnits;            
        },
        
        initPreferences: function() {
            if ('JPEG' === this.opts.outputImageType) {
                this.saveOptions = new JPEGSaveOptions();
                this.saveOptions.quality = 10;
                this.outputFileExtension = '.jpg';
            }
            else {
                this.saveOptions = new TiffSaveOptions();
                this.saveOptions.layers = false;
                this.saveOptions.transparency = false;
                this.saveOptions.alphaChannels = false;
                this.saveOptions.embedColorProfile = false;
                this.saveOptions.imageCompression = TIFFEncoding.TIFFLZW;
                this.saveOptions.saveImagePyramid = false;
                this.outputFileExtension = '.tiff';
            }
        },
        
        main: function() {
            this.initPreferences();
            
            var docs = app.documents,
                currentActive = app.activeDocument,                
                snapshotNameBase ='BeforeCropSaver: ',
                doc, start, snapshotName;            
            
            try {    
                for (var i = 0; i < docs.length; i++)
                {
                    doc = docs[i];
                    start = new Date();
                    snapshotName = snapshotNameBase + start.toISOString('T', false, 3);
                    
                    Stdlib.takeSnapshot(doc, snapshotName);
                    this.processDocument(doc);
                    Stdlib.revertToSnapshot(doc, snapshotName);
                }
            } catch (e) {
                Stdlib.revertToSnapshot(doc, snapshotName);                
                alert(e);
            }
            
            app.activeDocument = currentActive;
            
            alert(this.alertText);
        },
        
        processDocument: function(doc) {
            var mustHideTheLayer = false,
                mustDisableTheLayerMask = false,
                cropLayerRef;
                
            app.activeDocument = doc;
                
            try {
                // Clean up selection, if any
                doc.selection.clear();
            } catch (e) {}
            
            try {
                cropLayerRef = doc.artLayers.getByName(this.cropLayerName);
                
                if (false == cropLayerRef.visible) {
                    cropLayerRef.visible = true;
                    mustHideTheLayer = true; // after finishing our job with it
                }
                
                if (psx.hasLayerMask(doc, cropLayerRef)) {
                    if (!psx.isLayerMaskEnabled(doc, cropLayerRef)) {                    
                        psx.enableLayerMask(doc, cropLayerRef);
                        mustDisableTheLayerMask = true; // after finishing our job with it
                    }
                    
                    this.selectJustTheCrop();
                    
                    if (mustDisableTheLayerMask) {
                        mustDisableTheLayerMask = false;
                        psx.disableLayerMask(doc, cropLayerRef);
                    }
                }
                else {
                    // select all
                    this.selectAll(doc);
                }
                
                if (mustHideTheLayer) {
                    cropLayerRef.visible = false;
                    mustHideTheLayer = false;
                }
            } catch(e) {                    
                if ('No such element' == e.message || '- The object "layer "CROP"" is not currently available.' == e.message) {
                    // select all
                    this.selectAll(doc);
                }
                else {
                    throw (e);
                }
            }
            
            var bounds = psx.getSelectionBounds(doc),
                topLeftX = bounds[0],
                topLeftY = bounds[1],
                bottomRightX = bounds[2],
                bottomRightY = bounds[3],
                selectionWidth = bottomRightX - topLeftX,
                selectionHeight = bottomRightY - topLeftY; 
                
            this.copyMerged();
            
            this.alertText = ''.concat(this.alertText, doc.name, ' - OK.', this.okTextlineFeed);
            this.saveResult(doc, selectionWidth, selectionHeight);
        },
        
        /**
         * Save the contents of the clipboard to an image file
         *
         * @param {Document} doc
         * @param {Number} tempDocWidthAsNumber
         * @param {Number} tempDocHeightAsNumber
         */
        saveResult: function(doc, tempDocWidthAsNumber, tempDocHeightAsNumber) {
            var saveName = doc.name.split('.')[0],
                tempDocumentName = 'Temp-' + saveName,
                file = new File(this.opts.outputResultsDestinationPath + '/' + saveName + this.outputFileExtension),
                currentActive;
                
            // Add temporary document
            app.documents.add(tempDocWidthAsNumber, tempDocHeightAsNumber, 72, tempDocumentName, NewDocumentMode.RGB);
            currentActive = app.documents.getByName(tempDocumentName); // TODO: do we need this
            currentActive.paste();    
            currentActive.flatten();
            currentActive.saveAs(file, this.saveOptions, true, Extension.LOWERCASE);
            
            if (this.opts.wantSmallSize) {
                this.saveSmall(currentActive, saveName);
            }
            
            // Close the temporary document
            currentActive.close(SaveOptions.DONOTSAVECHANGES);
        },
        
        /**
         * Resize so that longer side is this.opts.smallSizeOutputImageLongerSide px
         * The idea for resizing is from xbytor's xtools ResizeImage.resize
         * Check http://ps-scripts.sourceforge.net/xtools.html
         * License: http://www.opensource.org/licenses/bsd-license.php
         *
         * @param {Document} doc
         * @param {String} saveName
         */
        saveSmall: function(doc, saveName) {
            var maxSize = this.opts.smallSizeOutputImageLongerSide,
                width = parseInt(doc.width),
                height = parseInt(doc.height),
                outputName, file, method, resolution;
                
            if (width > height) {
                outputName = ''.concat(saveName, '_width_', maxSize, 'px', this.outputFileExtension);
                method = (maxSize > width) ? ResampleMethod.BICUBICSMOOTHER : ResampleMethod.BICUBICSHARPER;
                doc.resizeImage(maxSize, null, resolution, method);
            }
            else {
                outputName = ''.concat(saveName, '_height_', maxSize, 'px', this.outputFileExtension);
                method = (maxSize > height) ? ResampleMethod.BICUBICSMOOTHER : ResampleMethod.BICUBICSHARPER;
                doc.resizeImage(null, maxSize, resolution, method);
            }
            
            file = new File(this.opts.outputResultsDestinationPath + '/' + outputName);
            doc.saveAs(file, this.saveOptions, true, Extension.LOWERCASE);
        },
        
        selectAll: function(doc) {
            doc.selection.selectAll();
        },
        
        /**
         * Via ActionManager code
         * Select the entire layer then subtract the mask from the selection
         */
        selectJustTheCrop: function() {
            var idnull = charIDToTypeID( "null" ),
                idOrdn = charIDToTypeID( "Ordn" ),
                idChnl = charIDToTypeID( "Chnl" ),
                idfsel = charIDToTypeID( "fsel" ),
                idslct = charIDToTypeID( "slct" ),
                idMkVs = charIDToTypeID( "MkVs" );
            
            // Make the layer active    
            var desc1 = new ActionDescriptor(),
                ref1 = new ActionReference(),
                idLyr = charIDToTypeID( "Lyr " );
                
                
            ref1.putName( idLyr, this.cropLayerName );
            desc1.putReference( idnull, ref1 );
            desc1.putBoolean( idMkVs, false );
            executeAction( idslct, desc1, DialogModes.NO );
        
            // Select the entire layer    
            var desc2 = new ActionDescriptor(),
                ref2 = new ActionReference(),
                idsetd = charIDToTypeID( "setd" ),
                idT = charIDToTypeID( "T   " ),
                idAl = charIDToTypeID( "Al  " );
                
            ref2.putProperty( idChnl, idfsel );
            desc2.putReference( idnull, ref2 );    
            desc2.putEnumerated( idT, idOrdn, idAl );
            executeAction( idsetd, desc2, DialogModes.NO );
        
            // Make the mask active
            var desc3 = new ActionDescriptor(),
                ref3 = new ActionReference(),        
                idMsk = charIDToTypeID( "Msk " );
            
            ref3.putEnumerated( idChnl, idChnl, idMsk );
            desc3.putReference( idnull, ref3 );    
            desc3.putBoolean( idMkVs, false );
            executeAction( idslct, desc3, DialogModes.NO );
        
            // Substract the mask from the selection
            var desc4 = new ActionDescriptor(),
                ref4 = new ActionReference(),
                ref5 = new ActionReference(),
                idSbtr = charIDToTypeID( "Sbtr" ),
                idTrgt = charIDToTypeID( "Trgt" ),
                idFrom = charIDToTypeID( "From" ),
                idVrsn = charIDToTypeID( "Vrsn" ),
                idmaskParameters = stringIDToTypeID( "maskParameters" );
            
            ref4.putEnumerated( idChnl, idOrdn, idTrgt );
            desc4.putReference( idnull, ref4 );
                    
            ref5.putProperty( idChnl, idfsel );
            desc4.putReference( idFrom, ref5 );
            
            desc4.putInteger( idVrsn, 1 );
            
            desc4.putBoolean( idmaskParameters, true );
            executeAction( idSbtr, desc4, DialogModes.NO );
        }
    };
    
    
    
    if (documents.length) {
        var cs = new CropSaver();
        cs.init();
    }
    else {
        alert("Open one or more documents before running this script.");
    }
})(); // Immediately-Invoked Function Expression (IIFE)