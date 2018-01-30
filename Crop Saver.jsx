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

    // EOF EXTRACT from psx.jsx;
    
    
    /**
     * @param{Object} opts - passed by reference
     */
    function CropSaverUi(opts) {
        this.bounds = {
            x: 200,
            y: 200,
            width: 650,
            height: 420
        };
        
        this.docNote = ''.concat('A series of documents is OPEN in Photoshop.',
                                 'They are layered documents with a layer in the document called CROP.',
                                 'This script saves the images cropped via the CROP layer.');
        
        this.opts = opts;
        
        this.title = 'Image Saving Preferences';
        
        this.windowRef = null;
    }

    CropSaverUi.prototype = {
        prepareWindow: function() {
            var that = this;
            
            // Create a window of type dialog.
            this.windowRef = new Window("dialog", this.title);
            this.windowRef.bounds = this.bounds;
            
            this.windowRef.notePanel = this.windowRef.add('panel', undefined, 'Note');
            this.windowRef.notePanel.noteStatic = this.windowRef.notePanel.add('statictext', undefined, this.docNote);
            
            // Add a frame for the contents.
            this.windowRef.btnPanel = this.windowRef.add("panel", [25, 15, 255, 130], "This is a test");
            // Add the components, two buttons
            this.windowRef.btnPanel.okBtn = this.windowRef.btnPanel.add("button", [15, 65, 105, 85], "OK");
            this.windowRef.btnPanel.cancelBtn = this.windowRef.btnPanel.add("button", [120, 65, 210, 85], "Cancel");
            // Register event listeners that define the button behavior
            this.windowRef.btnPanel.okBtn.onClick = function() {
                that.windowRef.close(0);
            };
            this.windowRef.btnPanel.cancelBtn.onClick = function() {
                that.windowRef.close(-1);
            };
            
            return this.windowRef;
        }
    };

    
    function CropSaver() {
        this.savePath = '~/PS Dev/Action Target';
        
        this.cropLayerName = 'CROP';
        
        this.opts = {
            saveResultsDestinationPath: '',
            resultsImageType: 'JPEG',
            wantSmallSize: false
        };
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
                
                alertText = alertText.concat('Gettind Preferences Result: ', result, "\n", 'Preferences: ', JSON.stringify(this.opts));
                alert(alertText);
                //this.main();
            } catch (e) {
                alert(e);
            }
            
            app.preferences.rulerUnits = originalRulerUnits;            
        },
        
        main: function() {
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
                    cropLayerRef = doc.artLayers.getByName(this.cropLayerName);
                } catch(e) {                    
                    if ('No such element' == e.message || '- The object "layer "CROP"" is not currently available.' == e.message) {
                        // test both
                        alertText = ''.concat(alertText, doc.name, "\n"," Warning: The 'CROP' layer is missing.",  "\n\n"); //"\n", e.message, "\n\n");
                        continue;
                    }
                    else {
                        throw (e);
                    }
                }
                
                if (false == cropLayerRef.visible) {
                    cropLayerRef.visible = true;
                    mustHideTheLayer = true; // after finishing our job with it
                }
                
                if (!psx.hasLayerMask(doc, cropLayerRef)) {
                    alertText = ''.concat(alertText, doc.name, "\n"," Warning: The 'CROP' layer has no mask.",  "\n\n");
                    continue;
                }
                
                if (!psx.isLayerMaskEnabled(doc, cropLayerRef)) {                    
                    psx.enableLayerMask(doc, cropLayerRef);
                    mustDisableTheLayerMask = true; // after finishing our job with it
                }
                
                try {
                    // Clean up selection, if any
                    doc.selection.clear();
                } catch (e) {}
                
                this.selectJustTheCrop();
                
                var bounds = psx.getSelectionBounds(doc),
                    topLeftX = bounds[0],
                    topLeftY = bounds[1],
                    bottomRightX = bounds[2],
                    bottomRightY = bounds[3],
                    selectionWidth = bottomRightX - topLeftX,
                    selectionHeight = bottomRightY - topLeftY; 
                    
                this.copyMerged();
                
                doc.selection.deselect();
                
                if (mustDisableTheLayerMask) {
                    mustDisableTheLayerMask = false;
                    psx.disableLayerMask(doc, cropLayerRef);
                }
                
                if (mustHideTheLayer) {
                    cropLayerRef.visible = false;
                    mustHideTheLayer = false;
                }
                
                okTextlineFeed = (docs.length - 1 != i) ? okTextlineFeed : "\n";
          
                alertText = ''.concat(alertText, doc.name, ' - OK.', okTextlineFeed);
                this.saveResult(doc, selectionWidth, selectionHeight);
            }
            
            alert(alertText);
        },
        
        /**
         * Save the contents of the clipboard to an image file
         *
         * @param {Document}
         * @param {Number} tempDocWidthAsNumber
         * @param {Number} tempDocHeightAsNumber
         */
        saveResult: function(doc, tempDocWidthAsNumber, tempDocHeightAsNumber) {
            var currentActive = app.activeDocument,
                saveName = doc.name.split('.')[0],
                tempDocumentName = 'Temp-' + saveName,
                file = new File(this.savePath + '/' + saveName + '.jpg'),
                opts = new JPEGSaveOptions(),
                tempDocWidth = new UnitValue(tempDocWidthAsNumber, 'px'),
                tempDocHeight = new UnitValue(tempDocHeightAsNumber, 'px');
                
            opts.quality = 10;
            
            // Add temporary document
            app.documents.add(tempDocWidth, tempDocHeight, 72, tempDocumentName, NewDocumentMode.RGB);
            currentActive = app.documents.getByName(tempDocumentName); // TODO: do we need this
            currentActive.paste();    
            currentActive.flatten();
            currentActive.saveAs(file, opts, true, Extension.LOWERCASE);
            
            // Close the temporary document
            currentActive.close(SaveOptions.DONOTSAVECHANGES)
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