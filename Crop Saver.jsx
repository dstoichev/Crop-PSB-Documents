#target photoshop

#include "./include/json2.js"

(function() {
    //
    //@show include
    //
    //
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
    //@show include
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


    // EOF EXTRACT from psx.jsx;
    
    
    
    /**
     * @param{Object} opts - passed by reference
     */
    function CropSaverUi(opts) {
        this.bounds = "x: 200, y: 200, width: 650, height: 420";
        
        this.docNote1 = ''.concat('Process all documents currently OPEN in Photoshop.');
        
        this.docNote2 = ''.concat('Save an image cropped via the CROP layer ',
                                  'when this layer exists and an image AS IS when the layer is absent.');
        
        this.opts = opts;
        
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
                    smallSizeGroup: Group{orientation: 'row', alignment: 'left',\
                        chb: Checkbox { text: ' Create small size images, too. Their longer side will be "+this.opts.smallSizeOutputImageLongerSide+"px.' } \
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
                }
                else {
                    that.opts.wantSmallSize = false;
                }
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
        this.cropLayerName = 'CROP';
        
        this.opts = {
            outputResultsDestinationPath: Folder.myDocuments.fsName,
            outputImageType: 'JPEG',
            wantSmallSize: false,
            smallSizeOutputImageLongerSide: 1000
        };
        
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
                    alertText = ''.concat('Crop Saver Preferences:', "\n"),
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
                this.saveOptions.transparency = true;
                this.saveOptions.alphaChannels = true;
                this.saveOptions.embedColorProfile = true;
                this.saveOptions.imageCompression = TIFFEncoding.TIFFLZW;
                this.saveOptions.saveImagePyramid = false;
                this.outputFileExtension = '.tiff';
            }
        },
        
        main: function() {
            this.initPreferences();
            
            var docs = app.documents,
                alertText = ''.concat('Processed documents:', "\n"),
                okTextlineFeed = "\n\n",
                mustHideTheLayer = false,
                mustDisableTheLayerMask = false,
                doc, cropLayerRef;
                
            for (var i = 0; i < docs.length; i++)
            {
                doc = docs[i];
                
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
                
                doc.selection.deselect();
                
                okTextlineFeed = (docs.length - 1 != i) ? okTextlineFeed : "\n";
          
                alertText = ''.concat(alertText, doc.name, ' - OK.', okTextlineFeed);
                this.saveResult(doc, selectionWidth, selectionHeight);
            }
            
            alert(alertText);
        },
        
        /**
         * Save the contents of the clipboard to an image file
         *
         * @param {Document} doc
         * @param {Number} tempDocWidthAsNumber
         * @param {Number} tempDocHeightAsNumber
         */
        saveResult: function(doc, tempDocWidthAsNumber, tempDocHeightAsNumber) {
            var currentActive = app.activeDocument,
                saveName = doc.name.split('.')[0],
                tempDocumentName = 'Temp-' + saveName,
                file = new File(this.opts.outputResultsDestinationPath + '/' + saveName + this.outputFileExtension);
                
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
            currentActive.close(SaveOptions.DONOTSAVECHANGES)
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
                outputName = saveName + '_SMALL' + this.outputFileExtension,
                file = new File(this.opts.outputResultsDestinationPath + '/' + outputName),
                method, resolution;
                
            if (width > height) {
                method = (maxSize > width) ? ResampleMethod.BICUBICSMOOTHER : ResampleMethod.BICUBICSHARPER;
                doc.resizeImage(maxSize, null, resolution, method);
            }
            else {
                method = (maxSize > height) ? ResampleMethod.BICUBICSMOOTHER : ResampleMethod.BICUBICSHARPER;
                doc.resizeImage(null, maxSize, resolution, method);
            }
            
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
    
    var cs = new CropSaver();
    
    if (documents.length) {
        /*
         suspendHistory(historyString, CropSavertring)
         
        Provides a single entry in history states for the entire script provided by CropSavertring .
        Allows a single undo for all actions taken in the script.
        The historyString parameter provides the string to use for the history state.
        The CropSavertring parameter provides a string of JavaScript code to
        excute while history is suspended.
        */
        app.activeDocument.suspendHistory("Crop Saver", "cs.init()");        
    }
    else {
        alert("Open one or more documents before running this script.");
    }
})(); // Immediately-Invoked Function Expression (IIFE)