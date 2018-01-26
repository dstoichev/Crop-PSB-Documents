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
    //
    //@show include
    //    
    // !!! Only an EXTRACT from psx.jsx !!!
    // @see http://ps-scripts.sourceforge.net/xtools.html
    //

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
    // Function: createLayerMask
    // Description: Creates a layer mask for a layer optionally from the
    //              current selection
    // Input:  doc   - a Document
    //         layer - a Layer
    //         fromSelection - should mask be made from the current selection (opt)
    // Return: <none>
    //
    psx.createLayerMask = function(doc, layer, fromSelection) {
      var desc = new ActionDescriptor();
      desc.putClass(cTID("Nw  "), cTID("Chnl"));
      var ref = new ActionReference();
      ref.putEnumerated(cTID("Chnl"), cTID("Chnl"), cTID("Msk "));
      desc.putReference(cTID("At  "), ref);
      if (fromSelection == true) {
        desc.putEnumerated(cTID("Usng"), cTID("UsrM"), cTID("RvlS"));
      } else {
        desc.putEnumerated(cTID("Usng"), cTID("UsrM"), cTID("RvlA"));
      }
      executeAction(cTID("Mk  "), desc, DialogModes.NO);
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
      return psx.getLayerDescriptor().hasKey(cTID("UsrM"));
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

    
    function CropSaver() {
        this.savePath = '~/PS Dev/Action Target';
        
        this.cropLayerName = 'CROP';
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
                this.main();
            } catch (e) {
                alert(e);
            }
            
            app.preferences.rulerUnits = originalRulerUnits;            
        },
        
        main: function() {
            var docs = app.documents,
                alertText = ''.concat('Processed documents:', "\n"),
                currentlyActive = app.activeDocument,
                okTextlineFeed = "\n\n",
                doc;
                
            for (var i = 0; i < docs.length; i++)
            {
                doc = docs[i];
                
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
                
                if (!psx.hasLayerMask(doc, cropLayerRef)) {
                    alertText = ''.concat(alertText, doc.name, "\n"," Warning: The 'CROP' layer has no mask.",  "\n\n");
                    continue;
                }
                
                app.activeDocument = doc;
                
                try {
                    // Clean up selection, if any
                    doc.selection.clear();
                } catch (e) {
                 
                }
                
                this.selectJustTheCrop();
                
                var bounds = psx.getSelectionBounds(doc),
                    topLeftX = bounds[0],
                    topLeftY = bounds[1],
                    bottomRightX = bounds[2],
                    bottomRightY = bounds[3],
                    selectionWidth = bottomRightX - topLeftX,
                    selectionHeight = bottomRightY - topLeftY,
                    region = new Array(new Array( topLeftX, topLeftY ),
                                       new Array( topLeftX + selectionWidth, topLeftY ),
                                       new Array( topLeftX + selectionWidth, topLeftY + selectionHeight ),
                                       new Array( topLeftX, topLeftY + selectionHeight ));
                
                doc.selection.select(region, SelectionType.REPLACE); // TODO: do we need this
                
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